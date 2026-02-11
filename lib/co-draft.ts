/**
 * Change Order draft generator: template-based with optional LLM.
 * When using LLM, evidence is cited as [EVID:id#chunk:i].
 * templateId: use an organization template for scope and line items.
 */

import { prisma } from '@/lib/db';
import { generateWithLLM } from '@/lib/llm-co';

const SCOPE_TEMPLATE = `Change Order – Scope Narrative

This Change Order addresses the following scope change(s) identified from project evidence:

{{DESCRIPTION}}

Supporting evidence has been linked to this change event. Contract clause references and cost/schedule impacts are outlined below.`;

export async function generateCODraft(
  changeEventId: string,
  options?: { templateId?: string; language?: 'tr' | 'en' }
): Promise<{
  scopeNarrative: string;
  contractClauses: string;
  assumptions: string;
  exclusions: string;
  suggestedLineItems: { description: string; quantity: number; unit: string; unitPrice: number }[];
  llmUsed: boolean;
  aiCostEstimate?: string | null;
  aiScheduleImpactDays?: number | null;
}> {
  const event = await prisma.changeEvent.findUniqueOrThrow({
    where: { id: changeEventId },
    include: {
      signals: { include: { evidence: { include: { chunks: true } } } },
    },
  });

  const description = event.description || event.title;
  let scopeNarrative: string;
  let contractClauses: string;
  let assumptions: string;
  let aiCostEstimate: string | null = null;
  let aiScheduleImpactDays: number | null = null;

  const llmResult = await generateWithLLM(changeEventId, { language: options?.language });
  if (llmResult) {
    scopeNarrative = llmResult.scopeNarrative;
    contractClauses = llmResult.contractClauses;
    assumptions = llmResult.assumptions;
    aiCostEstimate = llmResult.costEstimate;
    aiScheduleImpactDays = llmResult.scheduleImpactDays;
  } else if (options?.templateId) {
    const template = await prisma.cOTemplate.findUnique({
      where: { id: options.templateId },
    });
    scopeNarrative = template?.scopeBody || SCOPE_TEMPLATE.replace('{{DESCRIPTION}}', description);
    contractClauses = 'Contract clauses to be added from evidence.';
    assumptions = '- As per template.';
  } else {
    scopeNarrative = SCOPE_TEMPLATE.replace('{{DESCRIPTION}}', description);
    contractClauses = '';
    assumptions = '- Scope is as described in linked evidence.\n- Pricing to be confirmed with subcontractors.';
  }

  if (!llmResult && !options?.templateId) {
    const contractChunks: string[] = [];
    for (const sig of event.signals) {
      const ev = sig.evidence;
      if (ev.type === 'CONTRACT' && ev.chunks?.length) {
        for (let i = 0; i < Math.min(3, ev.chunks.length); i++) {
          contractChunks.push(`[EVID:${ev.id}#chunk:${i}] ${ev.chunks[i].content.slice(0, 300)}...`);
        }
      }
    }
    if (contractChunks.length) contractClauses = contractChunks.join('\n\n');
  }

  const exclusions = '- Work outside the described scope.\n- Consequential delays not documented.';
  let suggestedLineItems: { description: string; quantity: number; unit: string; unitPrice: number }[] = [
    { description: 'Additional scope – labor', quantity: 1, unit: 'LS', unitPrice: 0 },
    { description: 'Additional scope – materials', quantity: 1, unit: 'LS', unitPrice: 0 },
  ];

  if (options?.templateId) {
    const template = await prisma.cOTemplate.findUnique({
      where: { id: options.templateId },
    });
    const items = template?.lineItemsJson as { description?: string; quantity?: number; unit?: string; unitPrice?: number }[] | null;
    if (Array.isArray(items) && items.length) {
      suggestedLineItems = items.map((i) => ({
        description: i.description || '',
        quantity: i.quantity ?? 1,
        unit: i.unit || 'LS',
        unitPrice: i.unitPrice ?? 0,
      }));
    }
  }

  if (!contractClauses) {
    contractClauses = 'No contract evidence linked. Link CONTRACT evidence to this event for clause references.';
  }

  return {
    scopeNarrative,
    contractClauses,
    assumptions,
    exclusions,
    suggestedLineItems,
    llmUsed: !!llmResult,
    aiCostEstimate: llmResult ? aiCostEstimate : undefined,
    aiScheduleImpactDays: llmResult ? aiScheduleImpactDays : undefined,
  };
}
