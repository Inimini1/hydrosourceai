const FROM    = process.env.EMAIL_FROM    ?? 'HydroSource <noreply@hydrosource.appscloud365.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hydrosource.appscloud365.com'
const SUPPORT = process.env.SUPPORT_EMAIL ?? 'hydrosource.ai@appscloud365.com'

interface EmailAttachment {
  filename: string
  content: string // base64-encoded
}

async function send(to: string, subject: string, html: string, attachments?: EmailAttachment[]) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[HydroSource Email — dev mode]\nTo: ${to}\nSubject: ${subject}\n`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      ...(attachments && attachments.length > 0 && { attachments }),
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EEF2FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:40px auto;padding:0 16px">
    <div style="text-align:center;margin-bottom:24px">
      <img src="${APP_URL}/email-logo.png" width="48" height="65" alt="HydroSource AI" style="display:block;margin:0 auto 10px;border:0" />
      <span style="font-size:24px;font-weight:800;color:#006FFF">HydroSource</span><span style="font-size:24px;font-weight:800;color:#00C9B1"> AI</span>
    </div>
    <div style="background:#fff;border-radius:24px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      ${content}
    </div>
    <p style="text-align:center;color:#94A3B8;font-size:12px;margin-top:24px">
      © ${new Date().getFullYear()} HydroSource · You're receiving this because you signed up at <a href="${APP_URL}" style="color:#94A3B8">${APP_URL.replace('https://', '')}</a>
    </p>
  </div>
</body>
</html>`
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  const html = baseTemplate(`
    <h2 style="color:#0F172A;margin:0 0 8px">Verify your email</h2>
    <p style="color:#64748B;margin:0 0 28px;line-height:1.6">
      You're one step away from having crystal-clear pool water. Verify your email to activate your account.
    </p>
    <a href="${verifyUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#00C9B1,#00A99A);color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;font-size:15px;margin-bottom:24px">
      Verify my email →
    </a>
    <p style="color:#94A3B8;font-size:13px;text-align:center;margin:0">
      Link expires in 24 hours. If you didn't create an account, you can safely ignore this.
    </p>
  `)
  await send(email, 'Verify your HydroSource email', html)
}

export async function sendWaterReportEmail(
  to: string,
  poolName: string,
  testDate: Date,
  pdfBuffer: Buffer
) {
  const dateStr = testDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const filename = `HydroSource-report-${poolName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${testDate.toISOString().split('T')[0]}.pdf`

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#006FFF,#00D4AA);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
        <span style="font-size:24px">📊</span>
      </div>
      <h2 style="color:#0F172A;margin:0 0 8px;font-size:22px">Water Quality Report</h2>
      <p style="color:#64748B;margin:0;font-size:14px">${poolName} · ${dateStr}</p>
    </div>
    <p style="color:#475569;margin:0 0 20px;line-height:1.7;font-size:14px">
      Your HydroSource water analysis report is attached as a PDF. It includes your full diagnosis, immediate action plan, chemical dosing guide, and treatment recommendations.
    </p>
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 16px;margin-bottom:24px">
      <p style="color:#166534;margin:0;font-size:13px;font-weight:600">📎 Attachment: ${filename}</p>
    </div>
    <p style="color:#94A3B8;font-size:12px;margin:0;line-height:1.6;border-top:1px solid #F1F5F9;padding-top:16px">
      This report provides general water chemistry guidance only and is not a substitute for professional inspection or regulatory compliance. All recommendations are based on standard chemistry science, not legal advice.
    </p>
  `)

  await send(
    to,
    `HydroSource — ${poolName} Water Report (${dateStr})`,
    html,
    [{ filename, content: pdfBuffer.toString('base64') }]
  )
}

export async function sendBetaWelcomeEmail(to: string, name: string, signupUrl: string, expiresAt: Date) {
  const expiresStr = expiresAt.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#0FC490,#006FFF);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
        <span style="font-size:24px">🧪</span>
      </div>
      <h2 style="color:#0F172A;margin:0 0 8px;font-size:22px">You're in — Beta Access Granted</h2>
      <p style="color:#64748B;margin:0;font-size:14px">Welcome to the HydroSource private beta, ${name.split(' ')[0]}.</p>
    </div>
    <p style="color:#475569;margin:0 0 20px;line-height:1.7;font-size:14px">
      Your beta access includes all Pro features completely free. Use the button below to create your account — this link is unique to you and expires with your beta access.
    </p>
    <a href="${signupUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#0FC490,#006FFF);color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;font-size:15px;margin-bottom:24px">
      Create Your Beta Account →
    </a>
    <div style="background:#FFF8F0;border:1px solid #FDE68A;border-radius:12px;padding:14px 16px;margin-bottom:20px">
      <p style="color:#92400E;margin:0;font-size:13px;font-weight:600">⏰ Beta Access Expires: ${expiresStr}</p>
    </div>
    <div style="background:#FFF1F2;border:1px solid #FECDD3;border-radius:12px;padding:14px 16px;margin-bottom:20px">
      <p style="color:#991B1B;margin:0;font-size:13px;font-weight:700">🔒 Confidentiality Reminder</p>
      <p style="color:#9F1239;margin:6px 0 0;font-size:12px;line-height:1.6">This link and the HydroSource domain are confidential to you and your organization. Please do not share the URL, this email, or any access credentials with anyone outside your organization. Violation may result in immediate access revocation.</p>
    </div>
    <p style="color:#94A3B8;font-size:12px;margin:0;text-align:center">
      Questions? Contact us at <a href="mailto:${SUPPORT}" style="color:#006FFF">${SUPPORT}</a>
    </p>
  `)
  await send(to, 'HydroSource Beta Access — Create Your Account', html)
}

export async function sendBetaNotificationToOwner(
  name: string, company: string | undefined, email: string, expiresAt: Date
) {
  const expiresStr = expiresAt.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
  const html = baseTemplate(`
    <h2 style="color:#0F172A;margin:0 0 8px">New Beta Tester Submitted</h2>
    <p style="color:#64748B;margin:0 0 20px;font-size:14px">A new user has applied for beta access through your invite form.</p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:20px">
      ${[
        ['Name', name],
        ['Company / Org', company || 'Individual'],
        ['Email', email],
        ['Beta Expires', expiresStr],
      ].map(([label, value], i) => `
        <div style="display:flex;padding:12px 16px;${i > 0 ? 'border-top:1px solid #E2E8F0;' : ''}background:${i % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}">
          <span style="color:#64748B;font-size:13px;font-weight:600;min-width:140px">${label}</span>
          <span style="color:#0F172A;font-size:13px">${value}</span>
        </div>
      `).join('')}
    </div>
    <p style="color:#94A3B8;font-size:12px;margin:0;text-align:center">
      They have been sent their unique signup link automatically.
    </p>
  `)
  await send(SUPPORT, `[HydroSource Beta] New Tester: ${name} — Expires ${expiresAt.toLocaleDateString()}`, html)
}

export async function sendFeedbackNotificationEmail(
  fromEmail: string | null,
  category: string,
  message: string,
  pageUrl: string | null,
) {
  const html = baseTemplate(`
    <h2 style="color:#0F172A;margin:0 0 8px">New Beta Feedback</h2>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin:20px 0">
      ${[
        ['From', fromEmail ?? 'Anonymous'],
        ['Category', category],
        ['Page', pageUrl ?? 'unknown'],
      ].map(([label, value], i) => `
        <div style="display:flex;padding:12px 16px;${i > 0 ? 'border-top:1px solid #E2E8F0;' : ''}background:${i % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}">
          <span style="color:#64748B;font-size:13px;font-weight:600;min-width:100px">${label}</span>
          <span style="color:#0F172A;font-size:13px">${value}</span>
        </div>
      `).join('')}
    </div>
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;margin-bottom:16px">
      <p style="color:#166534;margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</p>
    </div>
    <p style="color:#94A3B8;font-size:12px;margin:0;text-align:center">
      Reply to this email to respond directly to the user.
    </p>
  `)
  await send(SUPPORT, `[HydroSource Feedback] ${category} from ${fromEmail ?? 'anonymous'}`, html)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = baseTemplate(`
    <h2 style="color:#0F172A;margin:0 0 8px">Reset your password</h2>
    <p style="color:#64748B;margin:0 0 28px;line-height:1.6">
      We received a request to reset your password. Click the button below — this link expires in 1 hour.
    </p>
    <a href="${resetUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#006FFF,#0057CC);color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;font-size:15px;margin-bottom:24px">
      Reset Password
    </a>
    <p style="color:#94A3B8;font-size:13px;text-align:center;margin:0">
      If you didn't request this, you can safely ignore this email.
    </p>
  `)
  await send(email, 'Reset your HydroSource password', html)
}
