'use server';

import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validateEmail, validatePassword, validateUsername, sanitizeString, LIMITS } from '@/lib/validation';
import { isRegisterRateLimited } from '@/lib/rate-limit';
import { redirect } from 'next/navigation';

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
  const passwordHash = await bcrypt.hash(passwordResult.password, 10);
  await prisma.user.create({
    data: { email: emailResult.email, passwordHash, name, username },
  });
  redirect('/login?registered=1');
}
