import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { isValidId } from '@/lib/validation';
import { getConversations, getMessagesWith, markChatAsRead } from '@/app/actions/chat';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="page-header sticky top-0 z-30 p-4 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border/80">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.siteScribe')}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link href="/guide">{t('nav.guide')}</Link>
          <Link href="/friends">
            <Button variant="ghost" size="sm">{t('nav.friends')}</Button>
          </Link>
          <Link href="/org">
            <Button variant="ghost" size="sm">{t('nav.organizations')}</Button>
          </Link>
          <Link href="/notifications">
            <Button variant="ghost" size="sm">{t('nav.notifications')}</Button>
          </Link>
          <span className="text-sm text-muted-foreground truncate max-w-[180px]">{session.user?.email}</span>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="outline" size="sm">{t('nav.signOut')}</Button>
          </form>
        </div>
      </header>
      <div className="flex-1 flex min-h-0">
        <aside className="w-full sm:w-72 border-r border-border/80 flex flex-col bg-muted/20">
          <div className="p-3 border-b border-border/80">
            <h2 className="font-semibold text-sm">{t('chat.conversations')}</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
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
                        className={`block rounded-lg p-3 text-sm transition-colors ${
                          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
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
        <section className="flex-1 flex flex-col min-w-0">
          {otherUser && currentUserId ? (
            <>
              <div className="border-b border-border/80 px-4 py-2">
                <h3 className="font-medium">{otherDisplayName}</h3>
              </div>
              <ChatThread
                otherUserId={otherUser.id}
                otherDisplayName={otherDisplayName}
                initialMessages={initialMessages}
                currentUserId={currentUserId}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <p className="text-center">{t('chat.selectConversation')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
