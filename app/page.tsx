import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-server';
import { LandingView } from '@/components/landing/landing-view';

export const metadata: Metadata = {
  title: 'SiteScribe – Evidence-Backed Change Orders | Open Source & Free',
  description:
    'Turn site logs, RFIs, plan revisions, and photos into clear Change Order drafts. One place for evidence, signals, events, and export. Optional AI. Free forever. Built for construction teams.',
  openGraph: {
    title: 'SiteScribe – Evidence-Backed Change Orders | Open Source & Free',
    description:
      'Turn site logs, RFIs, and plan revisions into Change Order drafts. Free forever. Built for construction.',
  },
};

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect('/org');
  return <LandingView />;
}
