'use client';

import { useState, useEffect, useRef } from 'react';
import { getMessagesWith, sendMessage } from '@/app/actions/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/components/locale-provider';
import { useRouter } from 'next/navigation';

type Msg = {
  id: string;
  body: string;
  createdAt: Date | string;
  senderId: string;
  sender: { id: string; username: string | null; name: string | null };
};

const POLL_INTERVAL_MS = 5000;

export function ChatThread({
  otherUserId,
  otherDisplayName,
  initialMessages,
  currentUserId,
}: {
  otherUserId: string;
  otherDisplayName: string;
  initialMessages: Msg[];
  currentUserId: string;
}) {
  const t = useT();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [otherUserId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getMessagesWith(otherUserId);
      if (!(result as { error?: string }).error && (result as { messages: Msg[] }).messages) {
        setMessages((result as { messages: Msg[] }).messages);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [otherUserId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body) return;
    setError('');
    setSending(true);
    const result = await sendMessage(otherUserId, body);
    setSending(false);
    if ((result as { error?: string }).error) {
      const err = (result as { error: string }).error;
      if (err === 'Not friends' || err.includes('friend')) setError(t('chat.errorNotFriends'));
      else if (err === 'Invalid user') setError(t('chat.errorInvalidUser'));
      else setError(t('chat.errorSend'));
      return;
    }
    setInput('');
    const updated = await getMessagesWith(otherUserId);
    if (!(updated as { error?: string }).error && (updated as { messages: Msg[] }).messages) {
      setMessages((updated as { messages: Msg[] }).messages);
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  isMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {error && <p className="text-sm text-destructive px-4">{error}</p>}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.typeMessage')}
          className="flex-1 min-w-0"
          maxLength={10000}
        />
        <Button type="submit" size="sm" disabled={sending}>
          {sending ? '...' : t('chat.send')}
        </Button>
      </form>
    </div>
  );
}
