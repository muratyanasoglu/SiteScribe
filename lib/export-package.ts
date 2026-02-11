/**
 * Generate Evidence Package: PDF summary + ZIP (PDF + evidence files + manifest.json).
 * Manifest: exportId, projectId, changeOrderId, createdAt, files: evidenceId, filename, sha256, size, mimeType.
 */

import { prisma } from '@/lib/db';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { sha256 } from '@/lib/hash';
import fs from 'fs';
import path from 'path';

export interface ManifestFile {
  evidenceId: string;
  filename: string;
  sha256: string;
  size: number;
  mimeType: string;
}

export interface Manifest {
  exportId: string;
  projectId: string;
  changeOrderId: string;
  createdAt: string;
  files: ManifestFile[];
}

async function fetchFileBuffer(fileUrl: string): Promise<Buffer> {
  if (fileUrl.startsWith('/uploads/')) {
    const p = path.join(process.cwd(), 'public', fileUrl.slice(1));
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }
  if (fileUrl.startsWith('http')) {
    const res = await fetch(fileUrl);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  return Buffer.alloc(0);
}

export async function generateExport(changeOrderId: string): Promise<{
  exportId: string;
  manifest: Manifest;
  pdfBuffer: Buffer;
  zipBuffer: Buffer;
}> {
  const co = await prisma.changeOrder.findUniqueOrThrow({
    where: { id: changeOrderId },
    include: {
      changeEvent: { include: { signals: { include: { evidence: true } } } },
      lineItems: true,
    },
  });

  const evidenceList = co.changeEvent
    ? [...new Map(co.changeEvent.signals.map((s) => [s.evidence.id, s.evidence])).values()]
    : [];
  const manifestFiles: ManifestFile[] = [];
  const zip = new JSZip();

  for (const ev of evidenceList) {
    let sha256Hash = ev.fileHash || '';
    let size = ev.size || 0;
    let filename = ev.title || ev.id;
    if (ev.fileUrl) {
      const buf = await fetchFileBuffer(ev.fileUrl);
      if (buf.length) {
        sha256Hash = sha256(buf);
        size = buf.length;
        const ext = ev.mimeType?.includes('pdf') ? 'pdf' : ev.mimeType?.includes('image') ? 'jpg' : 'bin';
        filename = `${ev.id}.${ext}`;
        zip.file(filename, buf);
      }
    }
    manifestFiles.push({
      evidenceId: ev.id,
      filename,
      sha256: sha256Hash,
      size,
      mimeType: ev.mimeType || 'application/octet-stream',
    });
  }

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let y = 750;
  const line = (text: string, size = 12) => {
    if (y < 50) return;
    doc.getPages()[0]?.drawText(text, { x: 50, y, size, font, color: rgb(0, 0, 0) });
    y -= size + 4;
  };

  if (doc.getPageCount() === 0) doc.addPage([612, 792]);
  line('SiteScribe – Change Order Evidence Package', 14);
  line(`Change Order: ${co.title}`);
  line(`Project ID: ${co.projectId}`);
  line(`Generated: ${new Date().toISOString()}`);
  y -= 10;
  line('Scope:', 11);
  line((co.scopeNarrative || '').slice(0, 1500));
  y -= 10;
  line('Contract clauses (excerpt):', 11);
  line((co.contractClauses || '').slice(0, 800));
  const pdfBytes = await doc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  zip.file('change-order-summary.pdf', pdfBuffer);

  const exportId = `exp-${Date.now()}`;
  const manifest: Manifest = {
    exportId,
    projectId: co.projectId,
    changeOrderId: co.id,
    createdAt: new Date().toISOString(),
    files: [
      { evidenceId: 'summary', filename: 'change-order-summary.pdf', sha256: sha256(pdfBuffer), size: pdfBuffer.length, mimeType: 'application/pdf' },
      ...manifestFiles,
    ],
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return { exportId, manifest, pdfBuffer, zipBuffer };
}
