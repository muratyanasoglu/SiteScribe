/**
 * Email service for invite and export delivery.
 * Uses Resend when RESEND_API_KEY is set; otherwise stubs (log only, no send).
 */

export async function sendInviteEmail(params: {
  to: string;
  inviterName: string;
  orgName: string;
  role: string;
  acceptUrl: string;
  expiresInDays: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email stub] Invite:', params.to, params.acceptUrl);
    return { ok: true };
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || 'SiteScribe <onboarding@resend.dev>';
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `${params.orgName} – SiteScribe invitation`,
      html: `
        <p>Hello,</p>
        <p><strong>${params.inviterName}</strong> has invited you to the <strong>${params.orgName}</strong> organization with the <strong>${params.role}</strong> role.</p>
        <p>To join: <a href="${params.acceptUrl}">${params.acceptUrl}</a></p>
        <p>This link is valid for ${params.expiresInDays} days.</p>
      `,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Send failed' };
  }
}

export async function sendExportEmail(params: {
  to: string;
  subject: string;
  body: string;
  attachmentBuffer?: Buffer;
  attachmentName?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email stub] Export to:', params.to);
    return { ok: true };
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || 'SiteScribe <onboarding@resend.dev>';
    const payload: { from: string; to: string; subject: string; html: string; attachments?: { filename: string; content: Buffer }[] } = {
      from,
      to: params.to,
      subject: params.subject,
      html: params.body.replace(/\n/g, '<br>'),
    };
    if (params.attachmentBuffer && params.attachmentName) {
      payload.attachments = [{ filename: params.attachmentName, content: params.attachmentBuffer }];
    }
    const { error } = await resend.emails.send(payload);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Send failed' };
  }
}
