import { listExports } from '@/app/actions/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function ExportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const exportsList = await listExports(projectId);
  return (
    <div className="space-y-5 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Exports</h1>
      <p className="text-muted-foreground text-sm">
        Evidence packages (PDF + ZIP + manifest) generated from Change Orders. Create exports from the CO page.
      </p>
      <div className="grid gap-5">
        {exportsList.length === 0 && (
          <p className="text-muted-foreground">No exports yet. Open a Change Order and use &quot;Export PDF + ZIP&quot;.</p>
        )}
        {exportsList.map((exp) => (
          <Card key={exp.id} className="card-interactive">
            <CardHeader className="pb-2">
              <CardTitle className="text-base break-words">
                Export {exp.id.slice(0, 8)} – {exp.changeOrder?.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {exp.createdAt.toLocaleString()} · {exp.status}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {exp.pdfUrl && (
                  <a href={exp.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                    Download PDF
                  </a>
                )}
                {exp.zipUrl && (
                  <a href={exp.zipUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                    Download ZIP
                  </a>
                )}
                {exp.changeOrderId && (
                  <Link href={`/projects/${projectId}/co/${exp.changeOrderId}`} className="text-primary text-sm hover:underline">
                    View CO →
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
