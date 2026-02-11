'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createScheduledExport } from '@/app/actions/scheduled-export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';
import { useT } from '@/components/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ScheduledExportForm({
  projectId,
  changeOrders,
}: {
  projectId: string;
  changeOrders: { id: string; title: string }[];
}) {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [cron, setCron] = useState('0 9 * * 1');
  const [changeOrderId, setChangeOrderId] = useState<string>('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createScheduledExport(projectId, {
      changeOrderId: changeOrderId || undefined,
      cron: cron.trim(),
      notificationEmail: notificationEmail.trim() || undefined,
    });
    setLoading(false);
    if ((result as { error?: string }).error) {
      toast((result as { error: string }).error, { variant: 'error' });
    } else {
      toast(t('project.scheduleAdded'), { variant: 'success' });
      setCron('0 9 * * 1');
      setChangeOrderId('');
      setNotificationEmail('');
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-xl">
      <div>
        <Label htmlFor="se-cron">{t('project.cronExpression')}</Label>
        <Input
          id="se-cron"
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder={t('project.cronPlaceholder')}
          className="mt-1 font-mono"
        />
      </div>
      <div>
        <Label>{t('project.coOptionalLabel')}</Label>
        <Select value={changeOrderId} onValueChange={setChangeOrderId}>
          <SelectTrigger className="mt-1 w-full max-w-[16rem]">
            <SelectValue placeholder={t('common.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('project.allCOs')}</SelectItem>
            {changeOrders.map((co) => (
              <SelectItem key={co.id} value={co.id}>{co.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="se-email">{t('project.emailOptionalLabel')}</Label>
        <Input
          id="se-email"
          type="email"
          placeholder={t('project.emailPlaceholder')}
          value={notificationEmail}
          onChange={(e) => setNotificationEmail(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <LoadingSpinner />}
        {loading ? t('common.adding') : t('project.addSchedule')}
      </Button>
    </form>
  );
}
