/**
 * Scheduled export cron endpoint. Call via GET?secret=CRON_SECRET (Vercel Cron or external).
 * If notificationEmail is set, sends email after export (requires RESEND_API_KEY).
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createExportJob, createExportJobFromBuffers } from '@/lib/export-job';
import { generateExport } from '@/lib/export-package';
import { sendExportEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = new URL(req.url).searchParams.get('secret');
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const jobs = await prisma.scheduledExport.findMany({
    where: { enabled: true },
    include: { project: true },
  });
  const now = new Date();
  const results: { id: string; status: string }[] = [];
  for (const job of jobs) {
    const run = !job.lastRunAt || (now.getTime() - job.lastRunAt.getTime() > 24 * 60 * 60 * 1000);
    if (!run) continue;
    try {
      const coIds = job.changeOrderId
        ? [job.changeOrderId]
        : (await prisma.changeOrder.findMany({ where: { projectId: job.projectId }, select: { id: true } })).map((c) => c.id);
      for (const changeOrderId of coIds) {
        if (job.notificationEmail?.trim()) {
          const co = await prisma.changeOrder.findFirst({
            where: { id: changeOrderId, projectId: job.projectId },
            select: { title: true },
          });
          if (!co) continue;
          const { exportId, manifest, pdfBuffer, zipBuffer } = await generateExport(changeOrderId);
          const subject = `SiteScribe – Scheduled Export: ${co.title}`;
          const body = `Scheduled export. Export ID: ${exportId}`;
          const result = await sendExportEmail({
            to: job.notificationEmail.trim(),
            subject,
            body,
            attachmentBuffer: zipBuffer,
            attachmentName: `sitescribe-export-${changeOrderId.slice(0, 8)}.zip`,
          });
          if (result.ok) {
            const { job: exportJob } = await createExportJobFromBuffers(
              job.projectId,
              changeOrderId,
              exportId,
              pdfBuffer,
              zipBuffer,
              manifest
            );
            await prisma.sentLog.create({
              data: {
                changeOrderId,
                sentTo: job.notificationEmail.trim(),
                method: 'resend',
                exportJobId: exportJob.id,
              },
            });
          }
        } else {
          await createExportJob(job.projectId, changeOrderId);
        }
      }
      await prisma.scheduledExport.update({
        where: { id: job.id },
        data: { lastRunAt: now },
      });
      results.push({ id: job.id, status: 'ok' });
    } catch {
      results.push({ id: job.id, status: 'failed' });
    }
  }
  return NextResponse.json({ ran: results.length, results });
}
