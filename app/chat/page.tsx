import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { isValidId } from '@/lib/validation';
import { getConversations, getMessagesWith, markChatAsRead } from '@/app/actions/chat';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileNavMenu } from '@/components/mobile-nav-menu';
import { Button } from '@/components/ui/button';
import { ChatThread } from './chat-thread';

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { with: withUserId } = await searchParams;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const conversations = await getConversations();

  let otherUser: { id: string; username: string | null; name: string | null } | null = null;
  let initialMessages: { id: string; body: string; createdAt: Date; senderId: string; sender: { id: string; username: string | null; name: string | null } }[] = [];
  let currentUserId: string | null = null;

  if (withUserId && isValidId(withUserId)) {
    const me = await (await import('@/lib/auth-server')).getCurrentUser();
    if (me) {
      currentUserId = me.id;
      const conv = conversations.find((c) => c.otherUser.id === withUserId);
      if (conv) {
        otherUser = conv.otherUser;
        await markChatAsRead(withUserId);
        const result = await getMessagesWith(withUserId);
        if (!(result as { error?: string }).error) {
          initialMessages = (result as { messages: typeof initialMessages }).messages ?? [];
        }
      }
    }
  }

  const otherDisplayName = otherUser
    ? (otherUser.username ?? otherUser.name ?? otherUser.id.slice(0, 8))
    : '';

  return (
    <div className="min-h-[100dvh] sm:min-h-screen bg-background flex flex-col">
      <header className="page-header sticky top-0 z-[60] shrink-0 p-3 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">{t('nav.siteScribe')}</h1>
        </div>
        <div className="flex items-center gap-2">
        <MobileNavMenu>
          <LanguageSwitcher />
          <Link href="/guide" className="nav-link min-h-[44px] flex items-center sm:min-h-0 text-sm whitespace-nowrap">{t('nav.guide')}</Link>
          <Link href="/friends">
            <Button variant="ghost" size="sm" className="min-h-10 min-w-10 touch-manipulation sm:min-h-0 sm:min-w-0">{t('nav.friends')}</Button>
          </Link>
          <Link href="/org">
            <Button variant="ghost" size="sm" className="min-h-10 min-w-10 touch-manipulation sm:min-h-0 sm:min-w-0">{t('nav.organizations')}</Button>
          </Link>
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="min-h-10 min-w-10 touch-manipulation sm:min-h-0 sm:min-w-0">{t('nav.notifications')}</Button>
          </Link>
          <Link href="/profile" className="nav-link min-h-[44px] flex items-center sm:min-h-0 text-sm whitespace-nowrap">{t('nav.profile')}</Link>
          <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[180px] px-2 py-2 sm:py-0">{session.user?.email}</span>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="outline" size="sm" className="min-h-10 touch-manipulation sm:min-h-0 w-full sm:w-auto">{t('nav.signOut')}</Button>
          </form>
        </MobileNavMenu>
        <ThemeToggle />
        </div>
      </header>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className={`w-full sm:w-72 border-r border-border/80 bg-muted/20 shrink-0 min-h-0 flex flex-col ${otherUser ? 'hidden sm:flex' : ''}`}>
          <div className="p-3 border-b border-border/80 shrink-0">
            <h2 className="font-semibold text-sm">{t('chat.conversations')}</h2>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain overflow-touch min-h-0">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t('chat.noConversations')}</p>
            ) : (
              <ul className="p-2 space-y-1">
                {conversations.map((c) => {
                  const name = c.otherUser.username ?? c.otherUser.name ?? c.otherUser.id.slice(0, 8);
                  const isActive = withUserId === c.otherUser.id;
                  return (
                    <li key={c.otherUser.id}>
                      <Link
                        href={`/chat?with=${encodeURIComponent(c.otherUser.id)}`}
                        className={`rounded-lg p-3 text-sm transition-colors min-h-[52px] flex flex-col justify-center touch-manipulation ${
                          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted active:bg-muted/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="font-medium truncate">{name}</span>
                          {c.unreadCount > 0 && (
                            <span className="shrink-0 rounded-full bg-destructive text-destructive-foreground text-xs px-2 py-0.5">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        {c.lastMessage && (
                          <p className={`text-xs mt-0.5 truncate ${isActive ? 'opacity-90' : 'text-muted-foreground'}`}>
                            {c.lastMessage.body.slice(0, 50)}
                            {c.lastMessage.body.length > 50 ? '…' : ''}
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
        <section className={`flex-1 flex flex-col min-w-0 min-h-0 ${otherUser ? 'flex' : 'hidden sm:flex'}`}>
          {otherUser && currentUserId ? (
            <>
              <div className="border-b border-border/80 px-3 sm:px-4 py-3 shrink-0 flex items-center gap-2 bg-background">
                <Link
                  href="/chat"
                  className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg -ml-2 touch-manipulation text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t('chat.conversations')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
                <h3 className="font-medium truncate flex-1">{otherDisplayName}</h3>
              </div>
              <ChatThread
                otherUserId={otherUser.id}
                otherDisplayName={otherDisplayName}
                initialMessages={initialMessages}
                currentUserId={currentUserId}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 min-h-0">
              <p className="text-center text-sm sm:text-base">{t('chat.selectConversation')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
