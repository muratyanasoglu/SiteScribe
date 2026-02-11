'use server';

import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validateEmail, validatePassword, validateUsername, validateSecurityQuestionKey, validateSecurityAnswer, sanitizeString, LIMITS, SECURITY_QUESTION_KEYS, type SecurityQuestionKey } from '@/lib/validation';
import { isRegisterRateLimited } from '@/lib/rate-limit';
import { redirect } from 'next/navigation';

/** Resolve email or username to a user (for forgot password). */
async function findUserByIdentifier(identifier: string) {
  const raw = identifier.trim();
  if (!raw) return null;
  const isEmail = raw.includes('@');
  return prisma.user.findFirst({
    where: isEmail
      ? { email: raw.toLowerCase() }
      : { username: raw.toLowerCase() },
    select: { id: true, securityQuestionKey: true, securityAnswerHash: true },
  });
}

export async function register(formData: FormData) {
  const h = await headers();
  if (isRegisterRateLimited(h)) {
    return { error: 'Too many registration attempts. Please try again later.' };
  }
  const emailResult = validateEmail(formData.get('email'));
  if (!emailResult.ok) return { error: emailResult.error };
  const passwordResult = validatePassword(formData.get('password'));
  if (!passwordResult.ok) return { error: passwordResult.error };
  const name = sanitizeString(formData.get('name'), LIMITS.name) || undefined;
  const usernameRaw = formData.get('username');
  let username: string | undefined;
  if (usernameRaw != null && String(usernameRaw).trim()) {
    const uResult = validateUsername(usernameRaw);
    if (!uResult.ok) return { error: uResult.error };
    username = uResult.username;
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return { error: 'This username is already taken' };
  }
  const existing = await prisma.user.findUnique({ where: { email: emailResult.email } });
  if (existing) return { error: 'This email is already registered' };

  const questionResult = validateSecurityQuestionKey(formData.get('securityQuestionKey'));
  if (!questionResult.ok) return { error: questionResult.error };
  const answerResult = validateSecurityAnswer(formData.get('securityAnswer'));
  if (!answerResult.ok) return { error: answerResult.error };

  const passwordHash = await bcrypt.hash(passwordResult.password, 10);
  const securityAnswerHash = await bcrypt.hash(answerResult.answer, 10);
  await prisma.user.create({
    data: {
      email: emailResult.email,
      passwordHash,
      name,
      username,
      securityQuestionKey: questionResult.key,
      securityAnswerHash,
    },
  });
  redirect('/login?registered=1');
}

/** Get security question for forgot-password flow. Returns questionKey or error. */
export async function getSecurityQuestion(identifier: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) return { error: 'User not found' };
  if (!user.securityQuestionKey || !user.securityAnswerHash) {
    return { error: 'Password recovery is not available for this account' };
  }
  if (!SECURITY_QUESTION_KEYS.includes(user.securityQuestionKey as SecurityQuestionKey)) {
    return { error: 'Password recovery is not available for this account' };
  }
  return { questionKey: user.securityQuestionKey as SecurityQuestionKey };
}

/** Verify security answer and set new password. */
export async function resetPasswordWithSecurityAnswer(
  identifier: string,
  securityAnswer: string,
  newPassword: string
) {
  const answerResult = validateSecurityAnswer(securityAnswer);
  if (!answerResult.ok) return { error: answerResult.error };
  const passwordResult = validatePassword(newPassword);
  if (!passwordResult.ok) return { error: passwordResult.error };

  const user = await findUserByIdentifier(identifier);
  if (!user || !user.securityQuestionKey || !user.securityAnswerHash) {
    return { error: 'Invalid request' };
  }
  const ok = await bcrypt.compare(answerResult.answer, user.securityAnswerHash);
  if (!ok) return { error: 'Wrong answer' };

  const passwordHash = await bcrypt.hash(passwordResult.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  return { ok: true };
}
