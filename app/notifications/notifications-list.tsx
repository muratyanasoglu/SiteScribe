'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { markNotificationRead, markAllNotificationsRead } from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast-provider';
import { useT } from '@/components/locale-provider';
import { BellOff } from 'lucide-react';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function markRead(id: string) {
    await markNotificationRead(id);
    toast(t('co.markedAsRead'), { variant: 'success', duration: 2000 });
    router.refresh();
  }

  async function markAllRead() {
    await markAllNotificationsRead();
    toast(t('co.allMarkedAsRead'), { variant: 'success' });
    router.refresh();
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BellOff className="h-10 w-10 text-muted-foreground/60 mb-2" />
        <p className="text-muted-foreground text-sm">{t('co.noNotifications')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {unreadCount > 0 && (
        <Button variant="outline" size="sm" onClick={markAllRead} className="mb-2">
          {t('co.markAllAsRead')}
        </Button>
      )}
      <ul className="space-y-1">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`rounded-lg border border-border/80 p-3 text-sm transition-colors duration-150 ${n.readAt ? 'opacity-75 bg-muted/30' : 'hover:bg-muted/50'}`}
          >
            <div className="flex justify-between gap-2">
              <div className="min-w-0">
                {n.link ? (
                  <Link href={n.link} className="font-medium hover:underline">
                    {n.title}
                  </Link>
                ) : (
                  <span className="font-medium">{n.title}</span>
                )}
                {n.body && <p className="text-muted-foreground mt-0.5">{n.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {n.createdAt.toLocaleString()}
                </p>
              </div>
              {!n.readAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 text-xs"
                  onClick={() => markRead(n.id)}
                >
                  {t('co.markReadButton')}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
