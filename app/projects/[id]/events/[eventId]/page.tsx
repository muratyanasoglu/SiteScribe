import Link from 'next/link';
import { getEvent } from '@/app/actions/signals';
import { listTemplatesForProject } from '@/app/actions/templates';
import { addComment } from '@/app/actions/comments';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommentForm } from './comment-form';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const { id: projectId, eventId } = await params;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const [event, templates] = await Promise.all([
    getEvent(projectId, eventId),
    listTemplatesForProject(projectId),
  ]);
  const evidenceList = Array.from(
    new Map(event.signals.map((s) => [s.evidence.id, s.evidence])).values()
  ).sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href={`/projects/${projectId}/signals`} className="hover:underline">{t('nav.signals')}</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{event.title}</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{event.title}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{event.description}</p>
          <p className="text-sm text-muted-foreground mt-1">Status: {event.status}</p>
        </div>
        <GenerateCODraftButton projectId={projectId} eventId={eventId} existingCoId={event.changeOrders[0]?.id} templates={templates} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('project.evidenceTimeline')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('project.evidenceTimelineDesc')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {evidenceList.length === 0 && (
            <p className="text-muted-foreground">No evidence linked yet. Run detection to link evidence.</p>
          )}
          {evidenceList.map((ev) => (
            <div key={ev.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 rounded-lg border border-border/80 p-3">
              <div className="text-xs text-muted-foreground shrink-0 sm:w-28">
                {ev.occurredAt.toLocaleDateString()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">{ev.title || ev.type}</p>
                <p className="text-xs text-muted-foreground">{ev.type}</p>
                {ev.fileUrl && (
                  <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                    Open file
                  </a>
                )}
                {ev.extractedText && (
                  <p className="text-xs mt-1 line-clamp-2">{ev.extractedText.slice(0, 200)}…</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CommentForm projectId={projectId} changeEventId={eventId} />
          {event.comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border/80 p-3 text-sm">
              <p>{c.body}</p>
              <p className="text-xs text-muted-foreground">{c.createdAt.toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { GenerateCODraftForm } from './generate-co-form';

function GenerateCODraftButton({
  projectId,
  eventId,
  existingCoId,
  templates,
}: {
  projectId: string;
  eventId: string;
  existingCoId?: string;
  templates: { id: string; name: string }[];
}) {
  if (existingCoId) {
    return (
      <Link href={`/projects/${projectId}/co/${existingCoId}`}>
        <Button>View CO draft</Button>
      </Link>
    );
  }
  return <GenerateCODraftForm projectId={projectId} eventId={eventId} templates={templates} />;
}
