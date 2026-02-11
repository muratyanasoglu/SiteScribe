/**
 * Export job creation (no auth here – used by server actions and cron).
 * createExportJobFromBuffers: build job from pre-generated buffers (e.g. for email delivery without re-running generateExport).
 */

import { prisma } from '@/lib/db';
import { generateExport } from '@/lib/export-package';
import { getStorageProvider } from '@/lib/storage';
import type { Manifest } from '@/lib/export-package';

export async function createExportJob(projectId: string, changeOrderId: string) {
  const { exportId, manifest, pdfBuffer, zipBuffer } = await generateExport(changeOrderId);
  return createExportJobFromBuffers(projectId, changeOrderId, exportId, pdfBuffer, zipBuffer, manifest);
}

export async function createExportJobFromBuffers(
  projectId: string,
  changeOrderId: string,
  exportId: string,
  pdfBuffer: Buffer,
  zipBuffer: Buffer,
  manifest: Manifest
) {
  const storage = getStorageProvider();
  const baseKey = `exports/${projectId}/${changeOrderId}/${exportId}`;
  const pdfKey = `${baseKey}/summary.pdf`;
  const zipKey = `${baseKey}/package.zip`;
  const [pdfResult, zipResult] = await Promise.all([
    storage.upload(pdfBuffer, pdfKey, { mimeType: 'application/pdf', projectId, evidenceId: '' }),
    storage.upload(zipBuffer, zipKey, { mimeType: 'application/zip', projectId, evidenceId: '' }),
  ]);
  const job = await prisma.exportJob.create({
    data: {
      projectId,
      changeOrderId,
      status: 'COMPLETED',
      pdfUrl: pdfResult.url,
      zipUrl: zipResult.url,
      manifestJson: manifest as object,
      completedAt: new Date(),
    },
  });
  return { job, pdfUrl: pdfResult.url, zipUrl: zipResult.url, manifest };
}
