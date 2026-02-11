'use server';

import { chat, isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

const HELP_SYSTEM = `You are the SiteScribe help assistant. You answer ONLY questions about SiteScribe. SiteScribe is a Change Order (CO) management web app for construction projects (evidence-backed Change Orders).

Knowledge (use only when the question is about SiteScribe):
- Evidence: Upload in project → Evidence (PDF/images). Types: site log, photo, RFI, plan revision, contract. AI can summarize or suggest type.
- Signals: Project → Signals → "Run detection" creates events from evidence; triage events.
- CO: Open an event → "Create CO draft" (template or AI). Edit on CO page; "Enrich with AI" refines with Mistral. Add line items as needed.
- Export: On CO page → "Export PDF + ZIP" or mailto/email.
- Search: Project → Search (full-text and semantic AI).
- Templates: Project → Templates. Scheduled exports: Project → Scheduled export (cron + optional email).
- Org roles: OWNER, PM, FIELD, SUBCONTRACTOR, VIEWER. Invitations and webhooks in org.

Strict rules:
- Answer ONLY questions about SiteScribe (features, how to use, evidence, signals, CO, export, templates, roles, etc.). Do not answer general knowledge, other products, coding, or any off-topic question.
- If the user asks anything not about SiteScribe (e.g. weather, other software, general chat), reply in one short sentence: "I only answer questions about SiteScribe. Ask me about evidence, signals, Change Orders, export, or other SiteScribe features."
- Keep answers short: 1–3 sentences unless they explicitly ask for more. No filler or repeating the question.`;

export async function sendHelpMessage(userMessage: string): Promise<{ text: string; error?: string }> {
  const trimmed = userMessage?.trim();
  if (!trimmed) return { text: '', error: 'Please enter a question.' };

  if (!isAiEnabled()) {
    return {
      text: '',
      error: 'Help assistant is currently unavailable (AI is disabled). You can: upload evidence under Evidence, run detection under Signals, create a CO draft from an event, and export from the CO page.',
    };
  }

  const result = await chat(
    [
      { role: 'system', content: HELP_SYSTEM },
      { role: 'user', content: trimmed },
    ],
    { maxTokens: 220, temperature: 0.3 }
  );

  if (!result?.content) {
    return { text: '', error: 'Sorry, I could not get an answer. Please try again.' };
  }

  if (result.usage) {
    await logAiUsage({
      operation: 'help_chat',
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });
  }

  return { text: result.content.trim() };
}
