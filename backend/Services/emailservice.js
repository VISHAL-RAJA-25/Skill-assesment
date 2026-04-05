const nodemailer = require('nodemailer');

// Configure with your Gmail or any SMTP
// For Gmail: enable "App Passwords" in Google Account → Security
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // App password, NOT your Gmail password
    },
});

// ── Welcome email on registration ─────────────────────────────────────────
exports.sendWelcomeEmail = async (toEmail) => {
    try {
        await transporter.sendMail({
            from: `"SkillAssess" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '⚡ Welcome to SkillAssess — Your Placement Journey Starts Now!',
            html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0c29;color:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:28px;letter-spacing:-0.5px;">⚡ SkillAssess</h1>
            <p style="margin:8px 0 0;opacity:0.85;font-size:14px;">Placement Readiness Platform</p>
          </div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 12px;font-size:24px;">Welcome to SkillAssess! 🎉</h2>
            <p style="color:rgba(255,255,255,0.8);line-height:1.7;margin:0 0 24px;font-size:16px;">
              Your account has been successfully created. We're excited to help you jumpstart your career!
            </p>
            
            <div style="background:rgba(255,255,255,0.06);border-left:4px solid #43e97b;border-radius:8px;padding:20px;margin-bottom:28px;">
              <p style="margin:0 0 10px;font-size:16px;font-weight:600;color:#43e97b;">
                🎯 Your Next Steps:
              </p>
              <p style="color:rgba(255,255,255,0.85);line-height:1.6;margin:0;font-size:15px;">
                Use our website to <strong>attend tests</strong> across diverse technical domains, and directly <strong>see what jobs you are eligible for</strong> based on your verified skill scores!
              </p>
            </div>

            <div style="text-align:center;margin:32px 0;">
              <a href="http://localhost:5173" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#4facfe,#00f2fe);color:#000;text-decoration:none;font-weight:700;font-size:16px;border-radius:30px;box-shadow:0 8px 20px rgba(79,172,254,0.3);">
                Access SkillAssess Now 🚀
              </a>
            </div>

            <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0;text-align:center;">
              Good luck with your placement journey! 
            </p>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">SkillAssess — Placement Readiness Platform</p>
          </div>
        </div>
      `,
        });
        console.log(`✅ Welcome email sent to ${toEmail}`);
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
        // Don't throw — email failure should not block registration
    }
};

// ── OTP email for forgot password ─────────────────────────────────────────
exports.sendOTPEmail = async (toEmail, otp) => {
    try {
        await transporter.sendMail({
            from: `"SkillAssess" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '🔑 Your SkillAssess Password Reset OTP',
            html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0c29;color:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:28px;">⚡ SkillAssess</h1>
          </div>
          <div style="padding:32px;text-align:center;">
            <h2 style="margin:0 0 12px;font-size:22px;">Password Reset OTP</h2>
            <p style="color:rgba(255,255,255,0.6);margin:0 0 28px;line-height:1.6;">
              Use the OTP below to reset your password. It expires in <strong style="color:#ffd93d;">10 minutes</strong>.
            </p>
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;padding:28px;display:inline-block;min-width:200px;">
              <p style="margin:0 0 6px;font-size:13px;opacity:0.8;letter-spacing:2px;">YOUR OTP</p>
              <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:12px;">${otp}</p>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:24px 0 0;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
        });
        console.log(`✅ OTP email sent to ${toEmail}`);
    } catch (err) {
        console.error('❌ OTP email failed:', err.message);
        throw err; // OTP failure should be reported
    }
};