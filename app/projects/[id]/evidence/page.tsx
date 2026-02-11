import Link from 'next/link';
import Image from 'next/image';
import { FileSearch } from 'lucide-react';
import { listEvidence } from '@/app/actions/evidence';
import { EvidenceUploadForm } from './evidence-upload-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const evidence = await listEvidence(projectId);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Evidence</h1>
        <div className="flex flex-wrap gap-2">
          <Link href={`/projects/${projectId}/evidence/compare`} className="text-sm text-muted-foreground hover:text-foreground min-h-[44px] flex items-center sm:min-h-0">
            Plan compare
          </Link>
          <EvidenceUploadForm projectId={projectId} />
        </div>
      </div>
      <div className="grid gap-4">
        {evidence.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center px-2">
            <FileSearch className="h-10 w-10 text-muted-foreground/60 mb-2" />
            <p className="text-muted-foreground max-w-sm">No evidence yet. You can upload site logs, photos, RFIs, plan revisions, or contracts.</p>
          </div>
        )}
        {evidence.map((e) => (
          <Card key={e.id} className="card-interactive">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{e.type}</span>
                {e.title || 'Untitled'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {e.occurredAt.toLocaleDateString()} · {e.mimeType || 'text'}
                {e.fileHash && ` · ${e.fileHash.slice(0, 8)}`}
              </p>
            </CardHeader>
            <CardContent>
              {e.description && <p className="text-sm mb-2">{e.description}</p>}
              {e.fileUrl && (
                <p className="text-sm">
                  {e.type === 'PHOTO' ? (
                    <div className="relative h-40 w-full max-w-xs overflow-hidden rounded">
                      <Image src={e.fileUrl} alt={e.title || ''} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <a href={e.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Open file
                    </a>
                  )}
                </p>
              )}
              {e.extractedText && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{e.extractedText.slice(0, 200)}…</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
