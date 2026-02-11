'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-server';
import { isValidId } from '@/lib/validation';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/lib/notifications';

export async function fetchNotifications(limit = 20) {
  const user = await getCurrentUser();
  if (!user) return [];
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  return getNotifications(user.id, safeLimit);
}

export async function fetchUnreadCount() {
  const user = await getCurrentUser();
  if (!user) return 0;
  return getUnreadCount(user.id);
}

export async function markNotificationRead(notificationId: string) {
  const user = await getCurrentUser();
  if (!user || !isValidId(notificationId)) return;
  await markAsRead(user.id, notificationId);
  revalidatePath('/notifications');
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;
  await markAllAsRead(user.id);
  revalidatePath('/notifications');
}
