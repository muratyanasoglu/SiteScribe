'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteScheduledExport, toggleScheduledExport } from '@/app/actions/scheduled-export';
import { Button } from '@/components/ui/button';

type Item = {
  id: string;
  projectId: string;
  changeOrderId: string | null;
  cron: string;
  lastRunAt: Date | null;
  enabled: boolean;
  notificationEmail: string | null;
  createdAt: Date;
};

export function ScheduledExportRow({ item, projectId }: { item: Item; projectId: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm('Delete this schedule?')) return;
    await deleteScheduledExport(projectId, item.id);
    router.refresh();
  }

  async function toggle() {
    await toggleScheduledExport(projectId, item.id, !item.enabled);
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 p-3 text-sm">
      <div>
        <p className="font-mono text-xs">{item.cron}</p>
        <p className="text-muted-foreground text-xs">
          {item.changeOrderId ? (
            <Link href={`/projects/${projectId}/co/${item.changeOrderId}`} className="text-primary hover:underline">
              Single CO
            </Link>
          ) : (
            'All COs'
          )}
          {' · '}
          {item.enabled ? 'Active' : 'Off'}
          {item.lastRunAt && ` · Last: ${item.lastRunAt.toLocaleString()}`}
          {item.notificationEmail && ` · Email: ${item.notificationEmail}`}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={toggle}>
          {item.enabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="ghost" size="sm" onClick={remove}>
          Delete
        </Button>
      </div>
    </li>
  );
}
