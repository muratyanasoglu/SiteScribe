import Link from 'next/link';
import { FileStack } from 'lucide-react';
import { getProject } from '@/app/actions/project';
import { listTemplatesForProject } from '@/app/actions/templates';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateCreateForm } from './template-create-form';
import { TemplateRow } from './template-row';

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const project = await getProject(projectId);
  const templates = await listTemplatesForProject(projectId);

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href={`/projects/${projectId}`} className="hover:underline">{t('nav.overview')}</Link>
        <span>/</span>
        <span className="text-foreground">{t('nav.templates')}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('project.templateLibrary')}</h1>
      <p className="text-muted-foreground text-sm">
        {t('project.templatesDescription')}
      </p>

      <Card className="card-interactive">
        <CardHeader>
          <CardTitle>{t('project.newTemplate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateCreateForm organizationId={project.organizationId} projectId={projectId} />
        </CardContent>
      </Card>

      <Card className="card-interactive">
        <CardHeader>
          <CardTitle>{t('project.existingTemplates')}</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <FileStack className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-muted-foreground text-sm">{t('project.noTemplatesYet')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('project.addTemplateAbove')}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {templates.map((t) => (
                <TemplateRow
                  key={t.id}
                  template={t}
                  organizationId={project.organizationId}
                  projectId={projectId}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
