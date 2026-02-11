'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendHelpMessage } from '@/app/actions/chat-help';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };

const QUICK_PROMPTS = [
  'How do I upload evidence?',
  'How do I create a CO draft?',
  'What is semantic search?',
  'How do I export a Change Order?',
  'What are signals and detection?',
];

export function HelpChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  async function handleSend(text?: string) {
    const toSend = (text ?? input).trim();
    if (!toSend || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: toSend }]);
    setLoading(true);
    try {
      const result = await sendHelpMessage(toSend);
      if (result.error) {
        setMessages((m) => [...m, { role: 'assistant', content: result.error! }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: result.text }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          'fixed z-50 flex flex-col rounded-2xl border border-border/80 bg-card shadow-soft-lg transition-all duration-200',
          'bottom-[max(5rem,calc(1rem+env(safe-area-inset-bottom)))] right-[max(1rem,env(safe-area-inset-right))]',
          'sm:bottom-[max(6rem,calc(1.5rem+env(safe-area-inset-bottom)))] sm:right-[max(1.5rem,env(safe-area-inset-right))]',
          open ? 'h-[420px] w-[calc(100vw-2rem)] max-w-[380px] opacity-100' : 'h-0 w-0 max-w-0 overflow-hidden opacity-0'
        )}
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">SiteScribe Help (project only)</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-sm">
              I only answer questions about SiteScribe: evidence, signals, Change Orders, export, AI, and how to use the app. I don&apos;t chat about other topics.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg px-3 py-2 text-sm',
                msg.role === 'user'
                  ? 'ml-6 bg-primary text-primary-foreground'
                  : 'mr-6 bg-muted'
              )}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking…</span>
            </div>
          )}
        </div>
        {messages.length === 0 && (
          <div className="border-t px-3 py-2">
            <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 border-t p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask only about SiteScribe…"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => handleSend()} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Floating button */}
      <Button
        size="icon"
        className="fixed z-40 h-12 w-12 rounded-full shadow-soft-md bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close help' : 'Open help chat'}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  );
}
