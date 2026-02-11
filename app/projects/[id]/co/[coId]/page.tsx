import Link from 'next/link';
import { getChangeOrder } from '@/app/actions/change-order';
import { getCOAuditLog } from '@/app/actions/audit';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COEditor } from './co-editor';
import { CommentForm } from './comment-form';
import { ExportAndMailto } from './export-mailto';
import { ExportByEmail } from './export-by-email';
import { EnrichWithAiButton } from './enrich-with-ai-button';

export default async function ChangeOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; coId: string }>;
  searchParams: Promise<{ llm?: string }>;
}) {
  const { id: projectId, coId } = await params;
  const { llm: llmParam } = await searchParams;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const [co, auditLogs] = await Promise.all([
    getChangeOrder(projectId, coId),
    getCOAuditLog(projectId, coId),
  ]);
  const showLlmBadge = llmParam === '1';
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {showLlmBadge && (
          <span className="text-sm text-primary font-medium rounded bg-primary/10 px-3 py-1.5">
            Draft enriched with Mistral AI
          </span>
        )}
        {co.aiCostEstimate && (
          <span className="text-sm rounded bg-muted px-3 py-1.5">AI cost estimate: {co.aiCostEstimate}</span>
        )}
        {co.aiRiskLevel && (
          <span className="text-sm rounded bg-muted px-3 py-1.5">Risk: {co.aiRiskLevel}</span>
        )}
        <EnrichWithAiButton projectId={projectId} coId={coId} hasEvent={!!co.changeEventId} />
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href={`/projects/${projectId}/signals`} className="hover:underline">Signals</Link>
        {co.changeEvent && (
          <>
            <span>/</span>
            <Link href={`/projects/${projectId}/events/${co.changeEvent.id}`} className="hover:underline">Event</Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">CO: {co.title}</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{co.title}</h1>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-end">
          <ExportButton projectId={projectId} changeOrderId={coId} />
          <ExportAndMailto projectId={projectId} changeOrderId={coId} />
          <ExportByEmail projectId={projectId} changeOrderId={coId} />
        </div>
      </div>

      <COEditor
        projectId={projectId}
        coId={coId}
        initial={{
          title: co.title,
          scopeNarrative: co.scopeNarrative ?? '',
          contractClauses: co.contractClauses ?? '',
          assumptions: co.assumptions ?? '',
          exclusions: co.exclusions ?? '',
          scheduleImpactDays: co.scheduleImpactDays ?? undefined,
          status: co.status,
          lineItems: co.lineItems,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CommentForm projectId={projectId} changeOrderId={coId} />
          {co.comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border/80 p-3 text-sm">
              <p>{c.body}</p>
              <p className="text-xs text-muted-foreground">{c.createdAt.toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('project.auditLog')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('project.recentChangesOnCOs')}</p>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('project.noRecordsYet')}</p>
          ) : (
            <ul className="space-y-2">
              {auditLogs.map((log) => (
                <li key={log.id} className="rounded-lg border border-border/80 p-3 text-sm">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-muted-foreground ml-2">
                    {log.createdAt.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground ml-2">User: {log.userId.slice(0, 8)}…</span>
                  {log.changesJson && typeof log.changesJson === 'object' && (
                    <pre className="mt-1 text-xs bg-muted p-2 rounded-lg overflow-x-auto max-w-full break-all whitespace-pre-wrap">
                      {JSON.stringify(log.changesJson)}
                    </pre>
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

import { CreateExportButton } from './create-export-button';

function ExportButton({ projectId, changeOrderId }: { projectId: string; changeOrderId: string }) {
  return <CreateExportButton projectId={projectId} changeOrderId={changeOrderId} />;
}
