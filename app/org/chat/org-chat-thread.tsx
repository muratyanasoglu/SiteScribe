'use client';

import { useState, useEffect, useRef } from 'react';
import { getOrgChatMessages, sendOrgChatMessage, type OrgChatMessageItem } from '@/app/actions/org-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/components/locale-provider';
import { useRouter } from 'next/navigation';

const POLL_INTERVAL_MS = 4000;

export function OrgChatThread({
  organizationId,
  orgName,
  initialMessages,
  currentUserId,
}: {
  organizationId: string;
  orgName: string;
  initialMessages: OrgChatMessageItem[];
  currentUserId: string;
}) {
  const t = useT();
  const router = useRouter();
  const [messages, setMessages] = useState<OrgChatMessageItem[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [organizationId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getOrgChatMessages(organizationId);
      if (!result.error && result.messages) setMessages(result.messages);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [organizationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body && !attachment) return;
    setError('');
    setSending(true);
    const formData = new FormData();
    formData.set('body', body || ' ');
    if (attachment) formData.set('file', attachment);
    const result = await sendOrgChatMessage(organizationId, formData);
    setSending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setInput('');
    setAttachment(null);
    const updated = await getOrgChatMessages(organizationId);
    if (!updated.error && updated.messages) setMessages(updated.messages);
    router.refresh();
  }

  const isImage = (mime: string | null) =>
    mime?.startsWith('image/');

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain overflow-touch p-3 sm:p-4 space-y-3 min-h-0">
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          const displayName = m.sender.name ?? m.sender.username ?? m.sender.id.slice(0, 8);
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-md sm:rounded-br-lg px-3 py-2.5 text-sm shadow-sm flex flex-col gap-1.5 ${
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-bl-2xl rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md rounded-br-2xl'
                }`}
              >
                {!isMe && (
                  <p className="text-[10px] sm:text-xs font-medium opacity-90">{displayName}</p>
                )}
                {m.attachmentUrl && (
                  <div className="rounded-lg overflow-hidden max-w-full">
                    {isImage(m.attachmentMimeType) ? (
                      <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.attachmentUrl}
                          alt={m.attachmentFileName ?? ''}
                          className="max-w-full max-h-64 object-contain rounded-lg"
                        />
                      </a>
                    ) : (
                      <a
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-2 py-1.5 rounded border text-xs ${isMe ? 'border-primary-foreground/40' : 'border-border'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {m.attachmentFileName ?? t('orgChat.attachment')}
                      </a>
                    )}
                  </div>
                )}
                {(m.body.trim() && m.body !== ' ') && (
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                )}
                <p className={`text-[10px] sm:text-xs mt-0.5 opacity-80 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {error && <p className="text-sm text-destructive px-3 sm:px-4 py-2 shrink-0">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 pt-2 pb-[env(safe-area-inset-bottom,0)] sm:pb-4 border-t border-border flex flex-col gap-2 shrink-0 bg-background"
      >
        {attachment && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate flex-1">{attachment.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAttachment(null)}
              className="shrink-0"
            >
              {t('orgChat.removeAttachment')}
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setAttachment(f);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10 touch-manipulation"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t('orgChat.attachFile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('orgChat.typeMessage')}
            className="flex-1 min-w-0 min-h-[44px] sm:min-h-10 text-base sm:text-sm touch-manipulation"
            maxLength={10000}
          />
          <Button type="submit" size="sm" disabled={sending} className="min-h-[44px] min-w-[52px] sm:min-h-10 touch-manipulation shrink-0">
            {sending ? '...' : t('chat.send')}
          </Button>
        </div>
      </form>
    </div>
  );
}
