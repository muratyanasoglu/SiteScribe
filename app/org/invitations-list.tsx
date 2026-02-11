'use client';

import { useRouter } from 'next/navigation';
import { revokeInvitation } from '@/app/actions/invite';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';

type Invitation = { id: string; email: string; role: string; expiresAt: Date };

export function InvitationsList({
  organizationId,
  invitations,
}: {
  organizationId: string;
  invitations: Invitation[];
}) {
  const router = useRouter();
  const t = useT();
  if (invitations.length === 0) return null;

  async function revoke(id: string) {
    await revokeInvitation(organizationId, id);
    router.refresh();
  }

  return (
    <div className="mt-2 rounded-lg border border-dashed border-border/80 p-3">
      <p className="text-xs font-medium text-muted-foreground mb-1">{t('org.pendingInvitations')}</p>
      <ul className="space-y-1">
        {invitations.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-2 text-sm">
            <span>{inv.email}</span>
            <span className="text-muted-foreground text-xs">{inv.role}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => revoke(inv.id)}
            >
              Cancel
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
