'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inviteMember, inviteMemberByFriendId } from '@/app/actions/invite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('VIEWER');
  const [friendId, setFriendId] = useState<string>('');
  const [friendRole, setFriendRole] = useState<string>('VIEWER');
  const [loading, setLoading] = useState(false);
  const [loadingFriend, setLoadingFriend] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOwner) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const result = await inviteMember(organizationId, email.trim(), role);
    setLoading(false);
    if ((result as { error?: string }).error) {
      setMessage((result as { error: string }).error);
    } else {
      setMessage(t('org.invitationSent'));
      setEmail('');
      router.refresh();
    }
  }

  async function submitFriend(e: React.FormEvent) {
    e.preventDefault();
    if (!friendId) return;
    setMessage('');
    setLoadingFriend(true);
    const result = await inviteMemberByFriendId(organizationId, friendId, friendRole);
    setLoadingFriend(false);
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
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <div>
          <Label className="text-xs">{t('auth.email')}</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('org.emailPlaceholder')}
            className="mt-1 h-8 w-full min-w-0 sm:w-48 max-w-xs"
            required
          />
        </div>
        <div>
          <Label className="text-xs">{t('org.role')}</Label>
          <Select value={role} onValueChange={setRole}>
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
        <Button type="submit" size="sm" disabled={loading}>{loading ? t('common.sending') : t('org.sendInvitation')}</Button>
      </form>
      {friendsNotInOrg.length > 0 && (
        <form onSubmit={submitFriend} className="flex flex-wrap items-end gap-2 pt-2 border-t border-border/60">
          <p className="text-xs text-muted-foreground w-full mb-1">{t('friends.inviteFromFriends')}</p>
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
          <Button type="submit" size="sm" variant="outline" disabled={loadingFriend || !friendId}>
            {loadingFriend ? t('common.sending') : t('friends.inviteToOrg')}
          </Button>
        </form>
      )}
      {message && <span className="text-sm text-muted-foreground block">{message}</span>}
    </div>
  );
}
