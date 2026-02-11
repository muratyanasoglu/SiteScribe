'use client';

import { useState } from 'react';
import { searchUsersByUsername, sendFriendRequest, type UserSearchResult } from '@/app/actions/friends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';
import { useRouter } from 'next/navigation';

export function AddFriendForm() {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [statusOverride, setStatusOverride] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setUsers([]);
    const q = query.trim();
    if (q.length < 2) {
      setError(t('friends.searchMinChars'));
      return;
    }
    setLoading(true);
    const result = await searchUsersByUsername(q);
    setLoading(false);
    if ((result as { error?: string }).error) {
      setError((result as { error: string }).error);
      return;
    }
    setUsers((result as { users: UserSearchResult[] }).users || []);
    if (((result as { users: UserSearchResult[] }).users?.length ?? 0) === 0) {
      setError(t('friends.noResults'));
    }
  }

  async function handleSendRequest(userId: string) {
    setSendingId(userId);
    setError('');
    const result = await sendFriendRequest(userId);
    setSendingId(null);
    if ((result as { error?: string }).error) {
      setError((result as { error: string }).error);
      return;
    }
    setStatusOverride((prev) => ({ ...prev, [userId]: 'pending_sent' }));
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-2">
        <div>
          <Label htmlFor="friend-search" className="text-sm">{t('friends.searchByUsername')}</Label>
          <Input
            id="friend-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('friends.searchPlaceholder')}
            className="mt-1 w-full min-w-[160px] max-w-xs"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? t('common.loading') : t('friends.searchButton')}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {users.length > 0 && (
        <ul className="space-y-2 rounded-lg border border-border/80 p-3">
          {users.map((u) => {
            const status = statusOverride[u.id] || u.status;
            return (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 p-2">
                <div>
                  <span className="font-medium">{u.username ?? u.email}</span>
                  {u.name && <span className="text-muted-foreground ml-2">({u.name})</span>}
                </div>
                {status === 'pending_sent' ? (
                  <span className="text-sm text-muted-foreground">{t('friends.pendingSent')}</span>
                ) : status === 'pending_received' ? (
                  <span className="text-sm text-muted-foreground">{t('friends.pendingReceived')}</span>
                ) : status === 'friends' ? (
                  <span className="text-sm text-muted-foreground">{t('friends.alreadyFriends')}</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sendingId === u.id}
                    onClick={() => handleSendRequest(u.id)}
                  >
                    {sendingId === u.id ? '...' : t('friends.sendRequest')}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
