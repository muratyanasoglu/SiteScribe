'use server';

import { requireProjectAccess } from '@/lib/auth-server';
import { isAiEnabled } from '@/lib/ai-mistral';
import { generateWithLLM } from '@/lib/llm-co';
import {
  generateEvidenceSummary,
  suggestEvidenceType,
  suggestTitleAndDescription,
} from '@/lib/ai-evidence';
import { semanticSearch } from '@/lib/ai-search';
import { projectChat } from '@/lib/ai-chat';
import { getDashboardSummary, getApprovalSummary } from '@/lib/ai-summaries';
import { getPlanRevisionSummary, getContractComplianceSummary, getRiskLevel } from '@/lib/ai-docs';
import { generatePhotoDescription } from '@/lib/ai-photo';
import { embedEvidence } from '@/lib/ai-search';
import { prisma } from '@/lib/db';

export async function isAiAvailable() {
  return isAiEnabled();
}

// Enrich existing Change Order with AI-generated scope, clauses, cost/schedule (updates CO in DB).
export async function enrichChangeOrderWithAi(projectId: string, coId: string, language?: 'tr' | 'en') {
  const { role } = await requireProjectAccess(projectId, 'PM');
  if (!isAiEnabled()) return { error: 'AI is disabled' };
  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, projectId },
    include: { changeEvent: true },
  });
  if (!co || !co.changeEventId) return { error: 'CO or event not found' };

  const result = await generateWithLLM(co.changeEventId, { language });
  if (!result) return { error: 'AI did not respond' };

  await prisma.changeOrder.update({
    where: { id: coId, projectId },
    data: {
      scopeNarrative: result.scopeNarrative,
      contractClauses: result.contractClauses,
      assumptions: result.assumptions,
      aiCostEstimate: result.costEstimate,
      scheduleImpactDays: result.scheduleImpactDays,
    },
  });
  return { ok: true };
}

// Generate AI summary for evidence and save; also create embedding for semantic search.
export async function generateAndSaveEvidenceSummary(projectId: string, evidenceId: string) {
  await requireProjectAccess(projectId, 'FIELD');
  if (!isAiEnabled()) return { error: 'AI is disabled' };
  const summary = await generateEvidenceSummary(evidenceId);
  if (!summary) return { error: 'Summary could not be generated' };
  await prisma.evidence.update({
    where: { id: evidenceId },
    data: { aiSummary: summary },
  });
  await embedEvidence(evidenceId);
  return { ok: true, summary };
}

// Suggest evidence type (SITE_LOG, PHOTO, etc.) via AI and save to evidence.
export async function suggestAndSaveEvidenceType(projectId: string, evidenceId: string) {
  await requireProjectAccess(projectId, 'FIELD');
  if (!isAiEnabled()) return { error: 'AI is disabled' };
  const suggested = await suggestEvidenceType(evidenceId);
  if (!suggested) return { error: 'Suggestion could not be retrieved' };
  await prisma.evidence.update({
    where: { id: evidenceId },
    data: { aiSuggestedType: suggested },
  });
  return { ok: true, suggestedType: suggested };
}

// Suggest title and description for evidence via AI and optionally save.
export async function suggestAndSaveTitleDescription(projectId: string, evidenceId: string) {
  await requireProjectAccess(projectId, 'FIELD');
  if (!isAiEnabled()) return { error: 'AI is disabled' };
  const suggested = await suggestTitleAndDescription(evidenceId);
  if (!suggested) return { error: 'Suggestion could not be retrieved' };
  await prisma.evidence.update({
    where: { id: evidenceId },
    data: { title: suggested.title || undefined, description: suggested.description || undefined },
  });
  return { ok: true, ...suggested };
}

// Semantic search over evidence and CO text (embedding similarity).
export async function runSemanticSearch(projectId: string, query: string, limit?: number) {
  await requireProjectAccess(projectId, 'VIEWER');
  return semanticSearch(projectId, query, { limit });
}

// RAG chat: project or CO context, evidence chunks + CO text.
export async function runProjectChat(projectId: string, message: string, coId?: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  if (!isAiEnabled()) return { error: 'AI is disabled' };
  const answer = await projectChat(projectId, message, { coId });
  if (!answer) return { error: 'Answer could not be retrieved' };
  return { ok: true, answer };
}

// AI-generated dashboard summary for the project (recent activity, COs, etc.).
export async function getProjectDashboardSummary(projectId: string, days?: number) {
  await requireProjectAccess(projectId, 'VIEWER');
  const summary = await getDashboardSummary(projectId, days ?? 7);
  return { summary };
}

// Summary of a CO for approval review (scope, cost, evidence refs).
export async function getCOApprovalSummary(projectId: string, changeOrderId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  const summary = await getApprovalSummary(changeOrderId);
  return { summary };
}

// Plan revision comparison summary (two text excerpts) via AI.
export async function getPlanCompareSummary(projectId: string, textA: string, textB: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  const summary = await getPlanRevisionSummary(textA, textB);
  return { summary };
}

// Contract compliance check for CO scope narrative.
export async function getCOContractCompliance(projectId: string, coId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, projectId },
    select: { scopeNarrative: true },
  });
  if (!co) return { error: 'CO not found' };
  const summary = await getContractComplianceSummary(projectId, co.scopeNarrative || '');
  return { summary };
}

// AI-derived risk level for the CO; saved to changeOrder.aiRiskLevel.
export async function getCORiskLevel(projectId: string, coId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  const level = await getRiskLevel(projectId, coId);
  if (!level) return { error: 'Could not be determined' };
  await prisma.changeOrder.update({
    where: { id: coId, projectId },
    data: { aiRiskLevel: level },
  });
  return { level };
}

// Generate image description for photo evidence (vision model).
export async function runPhotoDescription(projectId: string, evidenceId: string) {
  await requireProjectAccess(projectId, 'FIELD');
  if (!isAiEnabled()) return { error: 'AI is disabled' };
  const description = await generatePhotoDescription(evidenceId);
  if (!description) return { error: 'Description could not be generated' };
  return { ok: true, description };
}

// Create or refresh embedding for evidence (used by semantic search).
export async function createEvidenceEmbedding(projectId: string, evidenceId: string) {
  await requireProjectAccess(projectId, 'FIELD');
  const ok = await embedEvidence(evidenceId);
  return { ok };
}
