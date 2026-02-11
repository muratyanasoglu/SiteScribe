'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateSecurityQuestionKey,
  validateSecurityAnswer,
  sanitizeString,
  LIMITS,
} from '@/lib/validation';

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const name = sanitizeString(formData.get('name'), LIMITS.name) || undefined;
  const emailResult = validateEmail(formData.get('email'));
  if (!emailResult.ok) return { error: emailResult.error };

  const usernameRaw = formData.get('username');
  let username: string | undefined;
  if (usernameRaw != null && String(usernameRaw).trim() !== '') {
    const uResult = validateUsername(usernameRaw);
    if (!uResult.ok) return { error: uResult.error };
    username = uResult.username;
    const existingByUsername = await prisma.user.findFirst({
      where: { username, id: { not: user.id } },
    });
    if (existingByUsername) return { error: 'This username is already taken' };
  }

  const existingByEmail = await prisma.user.findFirst({
    where: { email: emailResult.email, id: { not: user.id } },
  });
  if (existingByEmail) return { error: 'This email is already in use' };

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email: emailResult.email, username: username ?? null },
  });

  if (emailResult.email !== user.email) {
    return { ok: true, emailChanged: true };
  }
  return { ok: true };
}

export async function updatePassword(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const currentPassword = formData.get('currentPassword');
  if (typeof currentPassword !== 'string' || !currentPassword.trim()) {
    return { error: 'Current password is required' };
  }
  const newPasswordResult = validatePassword(formData.get('newPassword'));
  if (!newPasswordResult.ok) return { error: newPasswordResult.error };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!dbUser?.passwordHash) return { error: 'Invalid request' };

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) return { error: 'Current password is incorrect' };

  const passwordHash = await bcrypt.hash(newPasswordResult.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  return { ok: true };
}

export async function updateSecurityQuestion(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const questionResult = validateSecurityQuestionKey(formData.get('securityQuestionKey'));
  if (!questionResult.ok) return { error: questionResult.error };
  const answerResult = validateSecurityAnswer(formData.get('securityAnswer'));
  if (!answerResult.ok) return { error: answerResult.error };

  const securityAnswerHash = await bcrypt.hash(answerResult.answer, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      securityQuestionKey: questionResult.key,
      securityAnswerHash,
    },
  });
  return { ok: true };
}
