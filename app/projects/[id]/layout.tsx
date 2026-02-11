import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { getProject } from '@/app/actions/project';
import { fetchUnreadCount } from '@/app/actions/notifications';
import { ProjectLayoutClient } from '@/components/project-layout-client';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { id } = await params;
  let project;
  try {
    project = await getProject(id);
  } catch {
    redirect('/projects');
  }
  const [unreadCount] = await Promise.all([fetchUnreadCount()]);
  const base = `/projects/${id}`;
  const nav = [
    { href: base, labelKey: 'nav.overview' },
    { href: `${base}/dashboard`, labelKey: 'nav.dashboard' },
    { href: `${base}/evidence`, labelKey: 'nav.evidence' },
    { href: `${base}/evidence/links`, labelKey: 'nav.evidenceLinks' },
    { href: `${base}/evidence/compare`, labelKey: 'nav.planCompare' },
    { href: `${base}/signals`, labelKey: 'nav.signals' },
    { href: `${base}/search`, labelKey: 'nav.search' },
    { href: `${base}/exports`, labelKey: 'nav.exports' },
    { href: `${base}/templates`, labelKey: 'nav.templates' },
    { href: `${base}/scheduled-exports`, labelKey: 'nav.scheduled' },
    { href: '/notifications', labelKey: 'nav.notifications', unreadCount },
  ];
  return (
    <ProjectLayoutClient base={base} nav={nav} projectName={project.name}>
      {children}
    </ProjectLayoutClient>
  );
}
