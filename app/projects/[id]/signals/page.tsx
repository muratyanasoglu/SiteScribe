import Link from 'next/link';
import { listEvents } from '@/app/actions/signals';
import { RunDetectionButton } from './run-detection-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusSelect } from './status-select';

export default async function SignalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const events = await listEvents(projectId);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Signals & events</h1>
        <RunDetectionButton projectId={projectId} />
      </div>
      <p className="text-muted-foreground text-sm">
        Run detection to scan recent evidence for change signals (keywords, plan revisions, RFIs). Then triage events and generate CO drafts.
      </p>
      <div className="grid gap-4">
        {events.length === 0 && (
          <p className="text-muted-foreground">No events yet. Run detection after adding evidence.</p>
        )}
        {events.map((e) => (
          <Card key={e.id} className="card-interactive">
            <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base break-words">
                <Link href={`/projects/${projectId}/events/${e.id}`} className="hover:underline">
                  {e.title}
                </Link>
              </CardTitle>
              <StatusSelect projectId={projectId} eventId={e.id} initialStatus={e.status} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{e.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {e.occurredAt.toLocaleDateString()} · {e.signals.length} signal(s)
              </p>
              <div className="mt-2 flex gap-2">
                <Link href={`/projects/${projectId}/events/${e.id}`}>
                  <span className="text-sm text-primary hover:underline">View timeline →</span>
                </Link>
                {e.changeOrders?.length > 0 && (
                  <Link href={`/projects/${projectId}/co/${e.changeOrders[0].id}`}>
                    <span className="text-sm text-primary hover:underline">CO draft →</span>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
