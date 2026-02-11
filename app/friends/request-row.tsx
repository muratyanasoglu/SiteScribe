'use client';

import { useState } from 'react';
import { acceptFriendRequest, declineFriendRequest } from '@/app/actions/friends';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';
import { useRouter } from 'next/navigation';

type FromUser = { id: string; username: string | null; name: string | null };

export function IncomingRequestRow({
  requestId,
  fromUser,
}: {
  requestId: string;
  fromUser: FromUser;
}) {
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    await acceptFriendRequest(requestId);
    setLoading(false);
    router.refresh();
  }
  async function decline() {
    setLoading(true);
    await declineFriendRequest(requestId);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 p-3">
      <div>
        <span className="font-medium">{fromUser.username ?? fromUser.name ?? 'User'}</span>
        {fromUser.name && fromUser.username && (
          <span className="text-muted-foreground ml-2">({fromUser.name})</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={accept} disabled={loading}>
          {t('friends.accept')}
        </Button>
        <Button size="sm" variant="outline" onClick={decline} disabled={loading}>
          {t('friends.decline')}
        </Button>
      </div>
    </li>
  );
}
