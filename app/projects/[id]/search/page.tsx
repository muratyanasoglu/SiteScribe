import Link from 'next/link';
import { projectSearch } from '@/app/actions/search';
import { runSemanticSearch, isAiAvailable } from '@/app/actions/ai';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchForm } from './search-form';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id: projectId } = await params;
  const { q } = await searchParams;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const [results, aiAvailable] = await Promise.all([
    q ? projectSearch(projectId, q) : Promise.resolve({ evidence: [], changeOrders: [] }),
    isAiAvailable(),
  ]);
  const semanticHits = q && aiAvailable ? await runSemanticSearch(projectId, q, 10) : [];
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('project.search_')}</h1>
      <SearchForm projectId={projectId} initialQuery={q} />
      {q && (
        <>
          {semanticHits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('project.semanticSearch')} (AI) ({semanticHits.length})</CardTitle>
                <p className="text-sm text-muted-foreground">{t('project.semanticMatches')}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {semanticHits.map((h) => (
                  <Link
                    key={h.evidenceId}
                    href={`/projects/${projectId}/evidence`}
                    className="block rounded-lg border border-border/80 p-3 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium">{h.evidenceTitle || h.type}</span>
                    <span className="text-muted-foreground ml-2">· {(h.score * 100).toFixed(0)}%</span>
                    {h.snippet && <p className="mt-1 text-muted-foreground line-clamp-2">{h.snippet}</p>}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence ({results.evidence.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.evidence.length === 0 && <p className="text-muted-foreground text-sm">No results.</p>}
              {results.evidence.map((e) => (
                <Link
                  key={e.id}
                  href={`/projects/${projectId}/evidence`}
                  className="block rounded-lg border border-border/80 p-3 text-sm hover:bg-muted/50 transition-colors"
                >
                  {e.title || e.type} · {e.occurredAt.toLocaleDateString()}
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Orders ({results.changeOrders.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.changeOrders.length === 0 && <p className="text-muted-foreground text-sm">No results.</p>}
              {results.changeOrders.map((co) => (
                <Link
                  key={co.id}
                  href={`/projects/${projectId}/co/${co.id}`}
                  className="block rounded-lg border border-border/80 p-3 text-sm hover:bg-muted/50 transition-colors"
                >
                  {co.title} · {co.status}
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
