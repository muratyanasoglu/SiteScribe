'use client';

import { useRouter } from 'next/navigation';
import { deleteTemplate } from '@/app/actions/templates';
import { Button } from '@/components/ui/button';

type Template = { id: string; name: string; scopeBody: string | null; updatedAt: Date };

export function TemplateRow({
  template,
  organizationId,
  projectId,
}: {
  template: Template;
  organizationId: string;
  projectId: string;
}) {
  const router = useRouter();

  async function remove() {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) return;
    await deleteTemplate(organizationId, template.id);
    router.refresh();
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-border/80 p-3">
      <div>
        <span className="font-medium">{template.name}</span>
        <span className="text-xs text-muted-foreground ml-2">
          {template.updatedAt.toLocaleDateString()}
        </span>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={remove}>
        Delete
      </Button>
    </li>
  );
}
