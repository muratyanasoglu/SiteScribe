import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type EvidenceInfo = {
  title: string;
  occurredAt: Date;
  fileUrl: string | null;
  extractedText: string | null;
};

export function CompareView({
  projectId,
  leftId,
  rightId,
  evidenceMap,
}: {
  projectId: string;
  leftId: string;
  rightId: string;
  evidenceMap: Record<string, EvidenceInfo>;
}) {
  const left = evidenceMap[leftId];
  const right = evidenceMap[rightId];
  if (!left || !right) return null;

  const truncate = (s: string | null, max: number) =>
    s ? (s.length <= max ? s : s.slice(0, max) + '…') : '—';

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Left: {left.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {left.occurredAt.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {left.fileUrl && (
            <a
              href={left.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Open file
            </a>
          )}
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Text preview (first 2000 characters)</p>
            <pre className="whitespace-pre-wrap break-words text-xs bg-muted p-2 rounded max-h-64 overflow-y-auto">
              {truncate(left.extractedText, 2000)}
            </pre>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Right: {right.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {right.occurredAt.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {right.fileUrl && (
            <a
              href={right.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Open file
            </a>
          )}
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Text preview (first 2000 characters)</p>
            <pre className="whitespace-pre-wrap break-words text-xs bg-muted p-2 rounded max-h-64 overflow-y-auto">
              {truncate(right.extractedText, 2000)}
            </pre>
          </div>
        </CardContent>
      </Card>
      <div className="md:col-span-2 text-sm text-muted-foreground border rounded p-3">
        PDF revision diff and revision notes will be added later.
      </div>
    </div>
  );
}
