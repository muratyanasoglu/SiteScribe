'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { canEditChangeOrder } from '@/lib/rbac';
import { generateCODraft } from '@/lib/co-draft';
import { auditLog } from '@/lib/audit';
import { triggerWebhooks } from '@/lib/webhook';
import { revalidatePath } from 'next/cache';

export async function createChangeOrderDraft(
  projectId: string,
  changeEventId: string,
  options?: { templateId?: string }
) {
  const { userId, role, project } = await requireProjectAccess(projectId, 'PM');
  if (!canEditChangeOrder(role)) return { error: 'Forbidden' };

  const draft = await generateCODraft(changeEventId, { templateId: options?.templateId });
  const co = await prisma.changeOrder.create({
    data: {
      projectId,
      changeEventId,
      title: `CO – ${changeEventId.slice(0, 8)}`,
      scopeNarrative: draft.scopeNarrative,
      contractClauses: draft.contractClauses,
      assumptions: draft.assumptions,
      exclusions: draft.exclusions,
      scheduleImpactDays: draft.aiScheduleImpactDays ?? null,
      aiCostEstimate: draft.aiCostEstimate ?? null,
      status: 'DRAFT',
    },
  });

  for (const item of draft.suggestedLineItems) {
    await prisma.changeOrderLineItem.create({
      data: {
        changeOrderId: co.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
      },
    });
  }

  await auditLog({
    entityType: 'ChangeOrder',
    entityId: co.id,
    userId,
    action: 'CREATE',
    changes: { title: co.title },
  });
  const org = await prisma.organization.findFirst({ where: { id: project.organizationId } });
  if (org) await triggerWebhooks(org.id, 'co.created', { changeOrderId: co.id, projectId });
  revalidatePath(`/projects/${projectId}/co/${co.id}`);
  revalidatePath(`/projects/${projectId}/events/${changeEventId}`);
  return { changeOrderId: co.id, llmUsed: draft.llmUsed };
}

export async function listChangeOrders(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.changeOrder.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true },
  });
}

export async function getChangeOrder(projectId: string, coId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.changeOrder.findFirstOrThrow({
    where: { id: coId, projectId },
    include: {
      changeEvent: true,
      lineItems: true,
      comments: true,
      approvals: true,
    },
  });
}

export async function updateChangeOrder(
  projectId: string,
  coId: string,
  data: {
    title?: string;
    scopeNarrative?: string;
    contractClauses?: string;
    assumptions?: string;
    exclusions?: string;
    scheduleImpactDays?: number | null;
    aiCostEstimate?: string | null;
    aiRiskLevel?: string | null;
    status?: string;
  }
) {
  const { userId, role } = await requireProjectAccess(projectId, 'PM');
  if (!canEditChangeOrder(role)) return;
  await prisma.changeOrder.update({
    where: { id: coId, projectId },
    data,
  });
  await auditLog({
    entityType: 'ChangeOrder',
    entityId: coId,
    userId,
    action: 'UPDATE',
    changes: data,
  });
  revalidatePath(`/projects/${projectId}/co/${coId}`);
}

export async function addLineItem(
  projectId: string,
  coId: string,
  formData: FormData
) {
  const { role } = await requireProjectAccess(projectId, 'PM');
  if (!canEditChangeOrder(role)) return { error: 'Forbidden' };
  const description = formData.get('description') as string;
  const quantity = parseFloat((formData.get('quantity') as string) || '1');
  const unit = (formData.get('unit') as string) || 'LS';
  const unitPrice = parseFloat((formData.get('unitPrice') as string) || '0');
  await prisma.changeOrderLineItem.create({
    data: {
      changeOrderId: coId,
      description: description || 'Line item',
      quantity,
      unit,
      unitPrice,
      amount: quantity * unitPrice,
    },
  });
  revalidatePath(`/projects/${projectId}/co/${coId}`);
}
