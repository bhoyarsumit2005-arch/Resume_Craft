import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendRegistrationOtpEmail(to: string, otp: string, name: string): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@resumecraft.app";

  await transporter.sendMail({
    from,
    to,
    subject: "ResumeCraft — Verify Your Email",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #4f46e5; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 18px;">
            ResumeCraft
          </div>
        </div>
        <h2 style="color: #1f2937; text-align: center; margin-bottom: 8px;">Verify Your Email</h2>
        <p style="color: #6b7280; text-align: center; margin-bottom: 24px;">
          Hi ${escapeHtml(name)}, thanks for signing up! Use the OTP below to verify your email address:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; background: #f3f4f6; border: 2px dashed #4f46e5; border-radius: 12px; padding: 16px 32px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">
            ${otp}
          </span>
        </div>
        <p style="color: #6b7280; text-align: center; font-size: 14px; margin-bottom: 24px;">
          This OTP is valid for <strong>10 minutes</strong>. If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; text-align: center; font-size: 12px;">
          © ${new Date().getFullYear()} ResumeCraft. All rights reserved.
        </p>
      </div>
    `,
  });
}

export async function sendOtpEmail(to: string, otp: string, name: string): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@resumecraft.app";

  await transporter.sendMail({
    from,
    to,
    subject: "ResumeCraft — Password Reset OTP",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #4f46e5; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 18px;">
            ResumeCraft
          </div>
        </div>
        <h2 style="color: #1f2937; text-align: center; margin-bottom: 8px;">Password Reset</h2>
        <p style="color: #6b7280; text-align: center; margin-bottom: 24px;">
          Hi ${escapeHtml(name)}, we received a request to reset your password. Use the OTP below:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; background: #f3f4f6; border: 2px dashed #4f46e5; border-radius: 12px; padding: 16px 32px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">
            ${otp}
          </span>
        </div>
        <p style="color: #6b7280; text-align: center; font-size: 14px; margin-bottom: 24px;">
          This OTP is valid for <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; text-align: center; font-size: 12px;">
          © ${new Date().getFullYear()} ResumeCraft. All rights reserved.
        </p>
      </div>
    `,
  });
}
