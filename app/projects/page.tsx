import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { getOrganizations } from '@/app/actions/org';
import { getProjects } from '@/app/actions/project';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsLayoutClient } from '@/components/projects-layout-client';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  const params = await searchParams;
  const orgId = typeof params.org === 'string' ? params.org : Array.isArray(params.org) ? params.org[0] : undefined;
  const [locale, orgs] = await Promise.all([getLocaleFromCookie(), getOrganizations()]);
  const messages = await getMessages(locale);
  const t = createT(messages);
  const selectedOrg = orgId ? orgs.find((o) => o.org.id === orgId)?.org : undefined;

  return (
    <ProjectsLayoutClient
      orgs={orgs.map((o) => o.org)}
      selectedOrgId={selectedOrg?.id}
    >
      {!selectedOrg && (
        <p className="text-muted-foreground">{t('project.selectOrgToView')}</p>
      )}
      {selectedOrg && (
        <ProjectsList organizationId={selectedOrg.id} t={t} />
      )}
    </ProjectsLayoutClient>
  );
}

async function ProjectsList({
  organizationId,
  t,
}: {
  organizationId: string;
  t: (key: string) => string;
}) {
  const projects = await getProjects(organizationId);
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('project.projects')}</h2>
        <CreateProjectButton organizationId={organizationId} />
      </div>
      <div className="grid gap-5">
        {projects.length === 0 && (
          <p className="text-muted-foreground">{t('project.noProjects')}</p>
        )}
        {projects.map((p) => (
          <Card key={p.id} className="card-interactive">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">
                <Link href={`/projects/${p.id}`} className="hover:underline break-words">{p.name}</Link>
              </CardTitle>
              {p.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link href={`/projects/${p.id}/evidence`}>
                  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0">{t('project.evidence')}</Button>
                </Link>
                <Link href={`/projects/${p.id}/signals`}>
                  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0">{t('project.signalsAndEvents')}</Button>
                </Link>
                <Link href={`/projects/${p.id}/exports`}>
                  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0">{t('project.exports_')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

import { CreateProjectForm } from './create-project-form';

function CreateProjectButton({ organizationId }: { organizationId: string }) {
  return <CreateProjectForm organizationId={organizationId} />;
}
