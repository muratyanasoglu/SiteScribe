import Link from 'next/link';
import { getProjectDashboard } from '@/app/actions/dashboard';
import { getProjectAuditLog } from '@/app/actions/audit';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const [stats, auditLogs] = await Promise.all([
    getProjectDashboard(projectId),
    getProjectAuditLog(projectId, 20),
  ]);
  return (
    <div className="space-y-5 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('project.dashboard')}</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="card-interactive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('project.evidenceCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.evidenceCount}</p>
          </CardContent>
        </Card>
        <Card className="card-interactive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('project.eventCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.eventCount}</p>
          </CardContent>
        </Card>
        <Card className="card-interactive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('project.coCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.coCount}</p>
          </CardContent>
        </Card>
        <Card className="card-interactive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('project.totalDelayDays')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalScheduleImpactDays}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle>{t('project.costSummary')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('project.totalFromCOLineItems')}</p>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.totalCost.toLocaleString('tr-TR')} ₺</p>
        </CardContent>
      </Card>

      <Card className="card-interactive">
        <CardHeader>
          <CardTitle>{t('project.recentAuditLog')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('project.recentChangesOnCOs')}</p>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('project.noRecordsYet')}</p>
          ) : (
            <ul className="space-y-2 overflow-x-auto">
              {auditLogs.map((log) => (
                <li key={log.id} className="rounded-lg border border-border/80 p-3 text-xs sm:text-sm flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-medium">{log.action}</span>
                  <Link
                    href={`/projects/${projectId}/co/${log.entityId}`}
                    className="text-primary hover:underline text-xs"
                  >
                    CO
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    {log.createdAt.toLocaleString()}
                  </span>
                  {log.changesJson && typeof log.changesJson === 'object' && (
                    <span className="text-xs text-muted-foreground">
                      {JSON.stringify(log.changesJson)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
