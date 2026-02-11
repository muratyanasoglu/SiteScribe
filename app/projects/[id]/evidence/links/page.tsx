import Link from 'next/link';
import { getEvidenceLinks } from '@/app/actions/evidence-links';
import { listEvidence } from '@/app/actions/evidence';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateLinkForm } from './create-link-form';

export default async function EvidenceLinksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const [links, evidence] = await Promise.all([
    getEvidenceLinks(projectId),
    listEvidence(projectId),
  ]);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('nav.evidenceLinks')}</h1>
        <CreateLinkForm projectId={projectId} evidenceList={evidence} />
      </div>
      <p className="text-muted-foreground text-sm">
        {t('project.viewRelationships')}
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('project.links')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {links.length === 0 && (
            <p className="text-muted-foreground text-sm">{t('project.noLinksYet')}</p>
          )}
          {links.map((link) => (
            <div key={link.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border/80 p-3 text-sm min-w-0">
              <Link href={`/projects/${projectId}/evidence`} className="text-primary hover:underline break-all">
                {link.fromEvidence.title || link.fromEvidence.type}
              </Link>
              <span className="text-muted-foreground shrink-0">→</span>
              <Link href={`/projects/${projectId}/evidence`} className="text-primary hover:underline break-all">
                {link.toEvidence.title || link.toEvidence.type}
              </Link>
              {link.linkType && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{link.linkType}</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
