'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inviteMemberByFriendId } from '@/app/actions/invite';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLES = ['VIEWER', 'SUBCONTRACTOR', 'FIELD', 'PM'] as const;

type FriendOption = { id: string; username: string | null; name: string | null; email: string };

export function InviteForm({
  organizationId,
  isOwner,
  friendsNotInOrg = [],
}: {
  organizationId: string;
  isOwner: boolean;
  friendsNotInOrg?: FriendOption[];
}) {
  const t = useT();
  const router = useRouter();
  const [friendId, setFriendId] = useState<string>('');
  const [friendRole, setFriendRole] = useState<string>('VIEWER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOwner) return null;

  async function submitFriend(e: React.FormEvent) {
    e.preventDefault();
    if (!friendId) return;
    setMessage('');
    setLoading(true);
    const result = await inviteMemberByFriendId(organizationId, friendId, friendRole);
    setLoading(false);
    if ((result as { error?: string }).error) {
      setMessage((result as { error: string }).error);
    } else {
      setMessage(t('org.invitationSent'));
      setFriendId('');
      router.refresh();
    }
  }

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-border/80 p-3">
      <p className="text-xs text-muted-foreground">{t('org.inviteOnlyFromFriends')}</p>
      {friendsNotInOrg.length > 0 ? (
        <form onSubmit={submitFriend} className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-xs">{t('friends.myFriends')}</Label>
            <Select value={friendId} onValueChange={setFriendId}>
              <SelectTrigger className="mt-1 h-8 w-full min-w-0 sm:w-48 max-w-xs">
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                {friendsNotInOrg.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.username ?? f.name ?? f.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t('org.role')}</Label>
            <Select value={friendRole} onValueChange={setFriendRole}>
              <SelectTrigger className="mt-1 h-8 w-full min-w-0 sm:w-32 max-w-[8rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={loading || !friendId}>
            {loading ? t('common.sending') : t('friends.inviteToOrg')}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t('org.noFriendsToInvite')}</p>
      )}
      {message && <span className="text-sm text-muted-foreground block">{message}</span>}
    </div>
  );
}
