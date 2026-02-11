/**
 * Mistral AI client wrapper: chat, embeddings, token usage logging.
 * Enabled when ENABLE_AI=true and MISTRAL_API_KEY is set.
 */

import { Mistral } from '@mistralai/mistralai';
import { prisma } from '@/lib/db';

const MODEL_CHAT = process.env.MISTRAL_MODEL || 'mistral-small-latest';
const MODEL_EMBED = process.env.MISTRAL_EMBED_MODEL || 'mistral-embed';

export function isAiEnabled(): boolean {
  return process.env.ENABLE_AI === 'true' && !!process.env.MISTRAL_API_KEY;
}

let _client: Mistral | null = null;

function getClient(): Mistral | null {
  if (!isAiEnabled()) return null;
  if (!_client) _client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });
  return _client;
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type ChatResult = {
  content: string;
  usage?: { inputTokens: number; outputTokens: number };
};

export async function chat(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number; responseFormat?: { type: 'json_object' } }
): Promise<ChatResult | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const body: Parameters<typeof client.chat.complete>[0] = {
      model: MODEL_CHAT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      maxTokens: options?.maxTokens ?? 2000,
      temperature: options?.temperature ?? 0.3,
      ...(options?.responseFormat && { responseFormat: options.responseFormat }),
    };
    const res = await client.chat.complete(body);
    const raw = res.choices?.[0]?.message?.content;
    const content = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.map((c: { type?: string; text?: string }) => c?.text ?? '').join('') : '';
    const usage = res.usage
      ? { inputTokens: res.usage.promptTokens ?? 0, outputTokens: res.usage.completionTokens ?? 0 }
      : undefined;
    return { content, usage };
  } catch {
    return null;
  }
}

export async function embed(texts: string[]): Promise<number[][] | null> {
  const client = getClient();
  if (!client || texts.length === 0) return null;
  try {
    const res = await client.embeddings.create({
      model: MODEL_EMBED,
      inputs: texts,
    });
    const data = res.data;
    if (!data || !Array.isArray(data)) return null;
    return data.map((d: { embedding?: number[] }) => d.embedding ?? []).filter((e) => e.length > 0);
  } catch {
    return null;
  }
}

export async function embedOne(text: string): Promise<number[] | null> {
  const result = await embed([text]);
  return result && result.length > 0 ? result[0] : null;
}

export async function logAiUsage(params: {
  operation: string;
  organizationId?: string | null;
  projectId?: string | null;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}): Promise<void> {
  try {
    await prisma.aiUsageLog.create({
      data: {
        organizationId: params.organizationId ?? undefined,
        projectId: params.projectId ?? undefined,
        operation: params.operation,
        model: params.model ?? MODEL_CHAT,
        inputTokens: params.inputTokens ?? undefined,
        outputTokens: params.outputTokens ?? undefined,
      },
    });
  } catch {
    // Logging errors are ignored so AI flow is not broken
  }
}

/** Cosine similarity between two vectors */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const den = Math.sqrt(na) * Math.sqrt(nb);
  return den === 0 ? 0 : dot / den;
}
