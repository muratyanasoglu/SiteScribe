import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { listScheduledExports } from '@/app/actions/scheduled-export';
import { listChangeOrders } from '@/app/actions/change-order';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduledExportForm } from './scheduled-export-form';
import { ScheduledExportRow } from './scheduled-export-row';

export default async function ScheduledExportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const [scheduled, changeOrders] = await Promise.all([
    listScheduledExports(projectId),
    listChangeOrders(projectId),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href={`/projects/${projectId}`} className="hover:underline">{t('nav.overview')}</Link>
        <span>/</span>
        <span className="text-foreground">{t('project.scheduledExport')}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('project.scheduledExport')}</h1>
      <p className="text-muted-foreground text-sm">
        {t('project.scheduledExportsDescription')}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('project.newSchedule')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('project.cronExpressionHelp')}
          </p>
        </CardHeader>
        <CardContent>
          <ScheduledExportForm
            projectId={projectId}
            changeOrders={changeOrders}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('project.currentSchedules')}</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduled.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CalendarClock className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-muted-foreground text-sm">{t('project.noSchedulesYet')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('project.addScheduleAbove')}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {scheduled.map((s) => (
                <ScheduledExportRow key={s.id} item={s} projectId={projectId} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
