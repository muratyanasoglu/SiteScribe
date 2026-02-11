/**
 * Exports CO line items and evidence list as CSV (for download or reporting).
 */

import { prisma } from '@/lib/db';

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return '';
  const s = String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function exportCOLineItemsCSV(changeOrderId: string): Promise<string> {
  const co = await prisma.changeOrder.findUniqueOrThrow({
    where: { id: changeOrderId },
    include: { lineItems: true },
  });
  const rows = [
    ['Description', 'Quantity', 'Unit', 'Unit Price', 'Amount'],
    ...co.lineItems.map((li) => [
      escapeCsv(li.description),
      escapeCsv(li.quantity),
      escapeCsv(li.unit),
      escapeCsv(li.unitPrice),
      escapeCsv(li.amount),
    ]),
  ];
  return rows.map((r) => r.join(',')).join('\n');
}

export async function exportEvidenceCSV(projectId: string): Promise<string> {
  const evidence = await prisma.evidence.findMany({
    where: { projectId },
    orderBy: { occurredAt: 'desc' },
  });
  const rows = [
    ['ID', 'Type', 'Title', 'Occurred At', 'File URL'],
    ...evidence.map((e) => [
      escapeCsv(e.id),
      escapeCsv(e.type),
      escapeCsv(e.title),
      escapeCsv(e.occurredAt.toISOString()),
      escapeCsv(e.fileUrl),
    ]),
  ];
  return rows.map((r) => r.join(',')).join('\n');
}
