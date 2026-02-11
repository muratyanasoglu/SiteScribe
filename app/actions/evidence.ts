'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { canUploadEvidence } from '@/lib/rbac';
import { getStorageProvider } from '@/lib/storage';
import { sha256 } from '@/lib/hash';
import { extractTextFromPdf, chunkText } from '@/lib/pdf-extract';
import { sanitizeString, LIMITS, ALLOWED_EVIDENCE_MIMES } from '@/lib/validation';
import { EvidenceType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const EVIDENCE_TYPES: EvidenceType[] = ['SITE_LOG', 'PHOTO', 'RFI_DOC', 'PLAN_REVISION', 'CONTRACT'];

export async function uploadEvidence(
  projectId: string,
  formData: FormData
): Promise<{ error?: string; evidenceId?: string }> {
  const { userId, role } = await requireProjectAccess(projectId, 'FIELD');
  if (!canUploadEvidence(role)) return { error: 'Forbidden' };

  const type = formData.get('type') as string;
  if (!type || !EVIDENCE_TYPES.includes(type as EvidenceType)) {
    return { error: 'Invalid evidence type' };
  }

  const title = sanitizeString(formData.get('title'), LIMITS.evidenceTitle) || undefined;
  const description = sanitizeString(formData.get('description'), LIMITS.evidenceDescription) || undefined;
  const occurredAtStr = formData.get('occurredAt') as string;
  const occurredAt = occurredAtStr ? new Date(occurredAtStr) : new Date();
  if (Number.isNaN(occurredAt.getTime())) return { error: 'Invalid date' };
  const file = formData.get('file') as File | null;
  const textContent = formData.get('textContent') as string | null;

  let fileUrl: string | null = null;
  let fileHash: string | null = null;
  let mimeType: string | null = null;
  let size: number | null = null;
  let extractedText: string | null = null;

  if (type === 'SITE_LOG' && textContent) {
    const maxText = 500 * 1024; // 500 KB metin
    const safe = textContent.slice(0, maxText);
    extractedText = safe;
    size = Buffer.byteLength(safe, 'utf8');
  } else if (file && file.size > 0) {
    if (file.size > LIMITS.evidenceFileSizeMax) {
      return { error: `Dosya en fazla ${LIMITS.evidenceFileSizeMax / 1024 / 1024} MB olabilir` };
    }
    const rawMime = file.type || 'application/octet-stream';
    if (!ALLOWED_EVIDENCE_MIMES.includes(rawMime as typeof ALLOWED_EVIDENCE_MIMES[number])) {
      return { error: 'Only JPEG, PNG, WebP or PDF can be uploaded' };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    fileHash = sha256(buffer);
    mimeType = rawMime;
    size = buffer.length;

    if (['RFI_DOC', 'PLAN_REVISION', 'CONTRACT'].includes(type) && rawMime === 'application/pdf') {
      const text = await extractTextFromPdf(buffer);
      if (text) extractedText = text;
    }

    const storage = getStorageProvider();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 200);
    const key = `${projectId}/${Date.now()}-${safeName}`;
    const result = await storage.upload(buffer, key, {
      mimeType,
      projectId,
      evidenceId: '', // we don't have id yet
    });
    fileUrl = result.url;
  }

  const evidence = await prisma.evidence.create({
    data: {
      projectId,
      type: type as EvidenceType,
      title: title || (file?.name ? file.name.slice(0, LIMITS.evidenceTitle) : 'Untitled'),
      description: description || null,
      occurredAt,
      fileUrl,
      fileHash,
      mimeType,
      size,
      extractedText,
      createdBy: userId,
    },
  });

  if (extractedText) {
    const chunks = chunkText(extractedText);
    await prisma.evidenceChunk.createMany({
      data: chunks.map((content, index) => ({
        evidenceId: evidence.id,
        index,
        content,
      })),
    });
  }

  revalidatePath(`/projects/${projectId}/evidence`);
  revalidatePath(`/projects/${projectId}/signals`);
  return { evidenceId: evidence.id };
}

export async function listEvidence(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.evidence.findMany({
    where: { projectId },
    orderBy: { occurredAt: 'desc' },
    include: { chunks: { orderBy: { index: 'asc' } } },
  });
}
