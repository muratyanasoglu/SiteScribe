import Link from 'next/link';
import { getProject } from '@/app/actions/project';
import { listEvents } from '@/app/actions/signals';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [locale, project, events] = await Promise.all([
    getLocaleFromCookie(),
    getProject(id),
    listEvents(id),
  ]);
  const messages = await getMessages(locale);
  const t = createT(messages);
  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground mt-1">{project.description}</p>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="card-interactive">
          <CardHeader>
            <CardTitle>{t('nav.evidence')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('project.uploadEvidence')}</p>
          </CardHeader>
          <CardContent>
            <Link href={`/projects/${id}/evidence`}>
              <Button>{t('project.goToEvidence')}</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="card-interactive">
          <CardHeader>
            <CardTitle>{t('project.signalsAndEvents')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('project.runDetectionDescription')}</p>
          </CardHeader>
          <CardContent>
            <Link href={`/projects/${id}/signals`}>
              <Button>{t('project.goToSignals')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('project.recentEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {events.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/projects/${id}/events/${e.id}`}
                    className="text-primary hover:underline"
                  >
                    {e.title}
                  </Link>
                  <span className="text-muted-foreground text-sm ml-2">({e.status})</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
