/**
 * Image description via Mistral Pixtral (vision). Uses MISTRAL_VISION_MODEL (e.g. pixtral-12b or pixtral-large).
 */

import { prisma } from '@/lib/db';
import { isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

const MODEL_VISION = process.env.MISTRAL_VISION_MODEL || 'pixtral-12b-2409';

async function describeImageWithMistral(
  imageUrl: string,
  projectId: string
): Promise<string | null> {
  if (!process.env.MISTRAL_API_KEY) return null;
  try {
    const { Mistral } = await import('@mistralai/mistralai');
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const res = await client.chat.complete({
      model: MODEL_VISION,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is visible in this construction site photo? Describe briefly in 1-3 sentences.' },
            { type: 'image_url', imageUrl },
          ],
        },
      ],
      maxTokens: 200,
    });
    const raw = res.choices?.[0]?.message?.content;
    const content =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw.map((c) => (c && typeof c === 'object' && 'text' in c ? String((c as { text: string }).text ?? '') : '')).join('')
          : '';
    if (res.usage) {
      await logAiUsage({
        operation: 'photo_description',
        projectId,
        inputTokens: res.usage.promptTokens ?? 0,
        outputTokens: res.usage.completionTokens ?? 0,
      });
    }
    return content.trim().slice(0, 500);
  } catch {
    return null;
  }
}

export async function generatePhotoDescription(evidenceId: string): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const ev = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    select: { fileUrl: true, projectId: true, type: true },
  });
  if (!ev || ev.type !== 'PHOTO' || !ev.fileUrl) return null;
  const description = await describeImageWithMistral(ev.fileUrl, ev.projectId);
  if (!description) return null;
  await prisma.evidence.update({
    where: { id: evidenceId },
    data: { aiSummary: description },
  });
  return description;
}
