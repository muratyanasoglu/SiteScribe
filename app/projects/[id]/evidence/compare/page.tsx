import Link from 'next/link';
import { listEvidence } from '@/app/actions/evidence';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanRevisionCompareForm } from './plan-revision-compare-form';
import { CompareView } from './compare-view';

export default async function PlanRevisionComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ left?: string; right?: string }>;
}) {
  const { id: projectId } = await params;
  const { left: leftId, right: rightId } = await searchParams;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const allEvidence = await listEvidence(projectId);
  const planRevisions = allEvidence.filter((e) => e.type === 'PLAN_REVISION');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href={`/projects/${projectId}/evidence`} className="hover:underline">{t('nav.evidence')}</Link>
        <span>/</span>
        <span className="text-foreground">{t('nav.planCompare')}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('project.planRevisionComparison')}</h1>
      <p className="text-muted-foreground text-sm">
        {t('project.selectTwoPlanRevisions')}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('project.selectRevision')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanRevisionCompareForm
            projectId={projectId}
            planRevisions={planRevisions.map((e) => ({ id: e.id, title: e.title || e.type, occurredAt: e.occurredAt }))}
            leftId={leftId}
            rightId={rightId}
          />
        </CardContent>
      </Card>

      {leftId && rightId && leftId !== rightId && (
        <CompareView
          projectId={projectId}
          leftId={leftId}
          rightId={rightId}
          evidenceMap={Object.fromEntries(
            planRevisions.map((e) => [
              e.id,
              {
                title: e.title || e.type,
                occurredAt: e.occurredAt,
                fileUrl: e.fileUrl,
                extractedText: e.extractedText,
              },
            ])
          )}
        />
      )}
    </div>
  );
}
