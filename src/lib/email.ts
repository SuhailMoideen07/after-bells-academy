import nodemailer from 'nodemailer';

/**
 * Transporter setup using environment variables for SMTP (e.g. Gmail App Password).
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(params: {
  toEmail: string;
  userName: string;
  resetLink: string;
}): Promise<{ success: boolean; simulated?: boolean }> {
  const { toEmail, userName, resetLink } = params;
  const transporter = getTransporter();

  // Escape HTML special characters to prevent injection in email content
  function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // HTML Email Template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070E1B; color: #E2E8F0; margin: 0; padding: 20px; }
          .container { max-width: 550px; margin: 0 auto; background-color: #0D182E; border-radius: 20px; border: 1px solid #1E293B; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .logo { text-align: center; margin-bottom: 24px; }
          .badge { display: inline-block; padding: 4px 12px; background-color: rgba(226, 177, 60, 0.1); border: 1px solid rgba(226, 177, 60, 0.3); border-radius: 9999px; color: #E2B13C; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          h2 { color: #FFFFFF; font-size: 22px; font-weight: 900; margin-top: 16px; text-align: center; }
          p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
          .btn-wrapper { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #E2B13C 0%, #C99824 100%); color: #0A192F; font-weight: 900; font-size: 14px; text-decoration: none; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(226, 177, 60, 0.3); }
          .footer { border-top: 1px solid #1E293B; margin-top: 32px; padding-top: 20px; text-align: center; font-size: 11px; color: #64748B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="badge">After Bells Academy</span>
            <h2>Password Reset Request</h2>
          </div>
          <p>Hello <strong>${escapeHtml(userName)}</strong>,</p>
          <p>We received a request to reset the password for your After Bells Academy account (<strong>${toEmail}</strong>). Click the gold button below to set a new password:</p>
          <div class="btn-wrapper">
            <a href="${resetLink}" class="btn" target="_blank">Reset Password Now →</a>
          </div>
          <p>This password reset link is valid for <strong>60 minutes</strong>. If you did not request this password reset, please ignore this email or contact support.</p>
          <div class="footer">
            <p>After Bells Academy Management System • Secure System Email</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[SIMULATED EMAIL TRANSMISSION]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Reset Your After Bells Academy Password`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'After Bells Academy'}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Reset Your After Bells Academy Password',
      html: htmlContent,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email via SMTP:', error.message || error);
    return { success: false };
  }
}
