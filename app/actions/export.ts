'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { canExport } from '@/lib/rbac';
import { isValidId } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { createExportJob, createExportJobFromBuffers } from '@/lib/export-job';
import { generateExport } from '@/lib/export-package';
import { sendExportEmail } from '@/lib/email';

export async function createExport(projectId: string, changeOrderId: string) {
  if (!isValidId(changeOrderId)) return { error: 'Invalid change order' };
  const { role } = await requireProjectAccess(projectId, 'VIEWER');
  if (!canExport(role)) return { error: 'Forbidden' };
  const { job, pdfUrl, zipUrl, manifest } = await createExportJob(projectId, changeOrderId);
  revalidatePath(`/projects/${projectId}/exports`);
  return { exportId: job.id, pdfUrl, zipUrl, manifest };
}

/** Send the export package as an email attachment via Resend. Requires RESEND_API_KEY. */
export async function sendExportByEmail(
  projectId: string,
  changeOrderId: string,
  recipientEmail: string
) {
  if (!isValidId(changeOrderId)) return { error: 'Invalid change order' };
  const { role } = await requireProjectAccess(projectId, 'VIEWER');
  if (!canExport(role)) return { error: 'Forbidden' };
  const co = await prisma.changeOrder.findFirst({
    where: { id: changeOrderId, projectId },
    select: { title: true },
  });
  if (!co) return { error: 'Change Order not found' };
  const { exportId, manifest, pdfBuffer, zipBuffer } = await generateExport(changeOrderId);
  const subject = `SiteScribe – Change Order Export: ${co.title}`;
  const body = `Change Order evidence package is attached.\n\nExport ID: ${exportId}\nProject/CO details are in manifest.json.`;
  const result = await sendExportEmail({
    to: recipientEmail.trim(),
    subject,
    body,
    attachmentBuffer: zipBuffer,
    attachmentName: `sitescribe-export-${changeOrderId.slice(0, 8)}.zip`,
  });
  if (!result.ok) return { error: result.error || 'Email could not be sent' };
  const { job } = await createExportJobFromBuffers(
    projectId,
    changeOrderId,
    exportId,
    pdfBuffer,
    zipBuffer,
    manifest
  );
  await prisma.sentLog.create({
    data: {
      changeOrderId,
      sentTo: recipientEmail.trim(),
      method: 'resend',
      exportJobId: job.id,
    },
  });
  revalidatePath(`/projects/${projectId}/exports`);
  return { ok: true, exportId: job.id };
}

export async function listExports(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.exportJob.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    include: { changeOrder: true },
  });
}

/** Record sent export log and return a mailto link for client-side "Export + mailto". */
export async function recordSentAndGetMailto(
  projectId: string,
  changeOrderId: string,
  exportJobId: string,
  recipientEmail: string
) {
  if (!isValidId(changeOrderId) || !isValidId(exportJobId)) return { error: 'Invalid request' };
  await requireProjectAccess(projectId, 'FIELD');
  await prisma.sentLog.create({
    data: {
      changeOrderId,
      sentTo: recipientEmail,
      method: 'mailto',
      exportJobId,
    },
  });
  const subject = encodeURIComponent(`Change Order Export – ${changeOrderId}`);
  const body = encodeURIComponent(
    `Please find the Change Order evidence package attached (download from the app). Export ID: ${exportJobId}`
  );
  const mailto = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  revalidatePath(`/projects/${projectId}/exports`);
  return { mailto };
}
