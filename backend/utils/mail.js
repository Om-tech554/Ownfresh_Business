import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: `"OwnFresh Support" <${process.env.EMAIL}>`,
    to,
    subject: "Reset Your Password – OTP Verification",
    html: `
      <div style="background-color:#FFFDF2;padding:24px;font-family:Arial,sans-serif;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;">
          
          <!-- Header -->
          <div style="background:#FFD700;padding:16px;text-align:center;">
            <h1 style="margin:0;color:#000;font-size:22px;">OwnFresh</h1>
          </div>

          <!-- Body -->
          <div style="padding:24px;color:#333;">
            <h2 style="margin-top:0;">Reset Your Password</h2>
            <p style="font-size:14px;color:#555;">
              We received a request to reset your password.  
              Please use the OTP below to continue.
            </p>

            <!-- OTP BOX -->
            <div style="margin:24px 0;text-align:center;">
              <span style="
                display:inline-block;
                padding:14px 24px;
                font-size:24px;
                font-weight:bold;
                letter-spacing:4px;
                background:#FFF3B0;
                color:#000;
                border-radius:8px;
                border:1px solid #FFD700;
              ">
                ${otp}
              </span>
            </div>

            <p style="font-size:14px;color:#555;">
              ⏳ This OTP will expire in <b>5 minutes</b>.
            </p>

            <p style="font-size:13px;color:#777;margin-top:16px;">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#F5F5F5;padding:12px;text-align:center;font-size:12px;color:#777;">
            © ${new Date().getFullYear()} OwnFresh. All rights reserved.
          </div>

        </div>
      </div>
    `,
  });
};
