'use client';

import { useRouter } from 'next/navigation';
import { updateEventStatus } from '@/app/actions/signals';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUSES = ['DETECTED', 'TRIAGE', 'DRAFTING', 'SENT', 'APPROVED', 'REJECTED', 'DISPUTE'];

export function StatusSelect({
  projectId,
  eventId,
  initialStatus,
}: {
  projectId: string;
  eventId: string;
  initialStatus: string;
}) {
  const router = useRouter();

  async function onValueChange(value: string) {
    await updateEventStatus(projectId, eventId, value);
    router.refresh();
  }

  return (
    <Select value={initialStatus} onValueChange={onValueChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
