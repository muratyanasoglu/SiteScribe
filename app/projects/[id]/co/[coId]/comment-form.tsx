'use client';

import { useState } from 'react';
import { addComment } from '@/app/actions/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function CommentForm({
  projectId,
  changeOrderId,
}: {
  projectId: string;
  changeOrderId: string;
}) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    await addComment(projectId, body.trim(), { changeOrderId });
    setBody('');
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        rows={2}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !body.trim()}>Post</Button>
    </form>
  );
}
