import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

function buildEmailHtml(name: string, email: string, subject: string, message: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://szamowski.dev";
  const logoUrl = `${siteUrl}/images/logo_header.svg`;
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#050a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050a08;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid rgba(13,223,114,0.2);">
          <img src="${logoUrl}" alt="szamowski.dev" height="28" style="display:block;height:28px;width:auto;" />
        </td></tr>
        <!-- Title -->
        <tr><td style="padding:32px 32px 8px;">
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">New Message</h1>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">${date}</p>
        </td></tr>
        <!-- Fields -->
        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;background-color:rgba(255,255,255,0.03);">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);width:100px;">
                <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#0ddf72;">From</span>
              </td>
              <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#ffffff;font-size:15px;">${escapeHtml(name)}</span>
                <a href="mailto:${escapeHtml(email)}" style="color:#6b7280;font-size:13px;margin-left:8px;text-decoration:none;">${escapeHtml(email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;width:100px;">
                <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#0ddf72;">Subject</span>
              </td>
              <td style="padding:16px 20px;">
                <span style="color:#ffffff;font-size:15px;">${escapeHtml(subject || "N/A")}</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Message -->
        <tr><td style="padding:0 32px 32px;">
          <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;background-color:rgba(255,255,255,0.03);padding:20px 24px;">
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#0ddf72;display:block;margin-bottom:12px;">Message</span>
            <p style="margin:0;color:#d1d5db;font-size:15px;line-height:1.7;">${escapeHtml(message)}</p>
          </div>
        </td></tr>
        <!-- CTA -->
        <tr><td align="center" style="padding:0 32px 32px;">
          <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background-color:#0ddf72;color:#000000;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">Reply to ${escapeHtml(name)}</a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">Sent from the contact form at <a href="${siteUrl}" style="color:#0ddf72;text-decoration:none;">szamowski.dev</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Contact form is not configured yet." },
        { status: 503 }
      );
    }

    await resend.emails.send({
      from: "Website Contact <contact@szamowski.dev>",
      to: process.env.CONTACT_EMAIL_TO!,
      replyTo: email,
      subject: `[szamowski.dev] ${subject || "New Contact"}`,
      html: buildEmailHtml(name, email, subject, message),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
