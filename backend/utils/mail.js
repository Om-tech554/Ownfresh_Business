import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateInvoicePdf, cleanProductTitle } from "./pdfGenerator.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: process.env.SMTP_SECURE === "false" ? false : true,
  connectionTimeout: 8000, // 8s connection timeout
  socketTimeout: 8000,     // 8s socket timeout
  greetingTimeout: 8000,   // 8s greeting timeout
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

export const sendContactMail = async (name, email, message) => {
  await transporter.sendMail({
    from: `"OwnFresh Contact Form" <${process.env.EMAIL}>`,
    to: "contact@myownfresh.com",
    subject: `New Message from ${name} via Contact Form`,
    html: `
      <div style="background-color:#F9F9F9;padding:24px;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <div style="background:#F9DD19;padding:20px;text-align:center;">
            <h1 style="margin:0;color:#000;font-size:24px;text-transform:uppercase;letter-spacing:2px;">Contact Form Submission</h1>
          </div>

          <div style="padding:32px;color:#333;">
            <p style="margin-bottom:20px;font-size:16px;">You have received a new message from the <b>OwnFresh</b> website contact form.</p>
            
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EEE;width:120px;"><b>Name:</b></td>
                <td style="padding:10px 0;border-bottom:1px solid #EEE;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EEE;"><b>Email:</b></td>
                <td style="padding:10px 0;border-bottom:1px solid #EEE;"><a href="mailto:${email}" style="color:#1E971D;text-decoration:none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:20px 0 10px 0;" colspan="2"><b>Message:</b></td>
              </tr>
              <tr>
                <td style="padding:15px;background:#F5F5F5;border-radius:8px;line-height:1.6;" colspan="2">
                  ${message.replace(/\n/g, '<br>')}
                </td>
              </tr>
            </table>
          </div>

          <div style="background:#F5F5F5;padding:15px;text-align:center;font-size:12px;color:#777;">
            Sent from OwnFresh Website Backend.
          </div>

        </div>
      </div>
    `,
  });
};

export const sendOrderConfirmationMail = async (order) => {
  if (!order || !order.user) {
    console.error("sendOrderConfirmationMail: Missing order or user information");
    return;
  }

  let attachments = [];
  try {
    const pdfBuffer = await generateInvoicePdf(order);
    attachments.push({
      filename: `Invoice_${(order.customOrderId || order._id).toString().replace(/[\/\\]/g, '_')}.pdf`,
      content: pdfBuffer
    });
  } catch (pdfErr) {
    console.error("Failed to generate PDF attachment for email:", pdfErr.message);
  }

  const userEmail = order.user.email || order.deliveryAddress?.email;
  const customId = order.customOrderId || (order._id ? order._id.toString() : "UNKNOWN");
  const customerName = order.user?.fullName || order.deliveryAddress?.phone || "Valued Customer";
  const customerPhone = order.deliveryAddress?.phone || order.user?.mobile || "";
  const deliveryAddress = order.deliveryAddress?.text || [
    order.deliveryAddress?.roomNumber,
    order.deliveryAddress?.areaName,
    order.deliveryAddress?.city,
    order.deliveryAddress?.state,
    order.deliveryAddress?.pincode
  ].filter(Boolean).join(", ") || "Your delivery address";

  const subtotal = (order.items || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const couponCode = order.couponCode ? order.couponCode.trim().toUpperCase() : null;
  const walletUsed = Number(order.walletDeductedAmount || 0);
  const coinsUsed = Number(order.commissionCoinsDeductedAmount || 0);
  const totalAmount = Number(order.totalAmount || 0);
  const siteUrl = "https://myownfresh.com";
  const logoUrl = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";

  const orderTimeStr = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const itemsCardsHtml = (order.items || []).map((item) => `
    <div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          ${item.image ? `
          <td style="width: 54px; vertical-align: top; padding-right: 12px;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #E5E7EB; background: #fafafa; display: block;" />
          </td>
          ` : ''}
          <td style="vertical-align: top;">
            <div style="font-size: 14px; font-weight: 700; color: #111827; line-height: 1.35; margin-bottom: 4px;">
              ${cleanProductTitle(item.name, item.variantName)}
            </div>
            ${item.variantName ? `
            <div style="margin-bottom: 4px;">
              <span style="display: inline-block; background: #F1F5F9; color: #334155; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #E2E8F0;">
                Size: ${item.variantName}
              </span>
            </div>
            ` : ''}
            <div style="font-size: 12px; color: #64748B;">
              Qty: <b style="color: #111827;">${item.quantity}</b> × ₹${Number(item.price || 0).toFixed(2)}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 85px; padding-left: 6px;">
            <div style="font-size: 15px; font-weight: 900; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              ₹${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `).join('');

  const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Order Confirmed #${customId}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 8px !important; }
      .email-card { border-radius: 12px !important; }
      .header-pad { padding: 20px 16px !important; }
      .body-pad { padding: 18px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1E293B;">
  <div class="email-wrapper" style="background-color: #F8FAFC; padding: 24px 12px; width: 100%; box-sizing: border-box;">
    <div class="email-card" style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
      
      <!-- Brand Logo Header -->
      <div style="background: #ffffff; border-bottom: 1px solid #F1F5F9; padding: 16px 20px; text-align: center;">
        <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
          <img src="${logoUrl}" alt="OwnFresh" style="height: 44px; border: none; display: inline-block; vertical-align: middle;" />
        </a>
      </div>

      <!-- Hero Banner -->
      <div class="header-pad" style="background: linear-gradient(135deg, #14532D 0%, #166534 100%); padding: 26px 22px; color: #ffffff; text-align: center;">
        <div style="font-size: 34px; line-height: 1; margin-bottom: 8px;">🌿</div>
        <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; color: #ffffff;">
          Order Confirmed!
        </h1>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #D1E7D5; line-height: 1.45;">
          Thank you for choosing pure cold-pressed oils with OwnFresh.
        </p>

        <!-- Order ID & Amount Pill (100% Mobile Safe) -->
        <div style="display: inline-block; background: rgba(0,0,0,0.26); border: 1px solid rgba(255,255,255,0.25); padding: 8px 18px; border-radius: 20px;">
          <span style="font-size: 12px; font-weight: 700; color: #E2E8F0;">Order:</span>
          <span style="font-size: 13px; font-weight: 900; color: #FFD700; margin-left: 4px;">#${customId}</span>
          <span style="display: inline-block; margin: 0 8px; color: rgba(255,255,255,0.4);">•</span>
          <span style="font-size: 12px; font-weight: 700; color: #E2E8F0;">Paid:</span>
          <span style="font-size: 13px; font-weight: 900; color: #A7F3D0; margin-left: 4px;">₹${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <!-- Body Content -->
      <div class="body-pad" style="padding: 24px 22px;">
        <p style="font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 8px 0;">
          Hi ${customerName},
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 18px 0;">
          We have received your order and payment successfully. Our artisans are now preparing your fresh, pure stone-pressed oils for dispatch. Your official Tax Invoice is attached to this email.
        </p>

        <!-- Delivery Address Card -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;">
          <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
            📍 Shipping To
          </div>
          <div style="font-size: 13px; color: #1E293B; line-height: 1.55; font-weight: 500;">
            ${deliveryAddress}
          </div>
          ${customerPhone ? `
          <div style="margin-top: 6px; font-size: 12px; color: #64748B;">
            Contact: <b style="color: #1E293B;">${customerPhone}</b>
          </div>
          ` : ''}
        </div>

        <!-- Purchased Products Header -->
        <div style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          Your Items (${order.items?.length || 0})
        </div>

        <!-- Items List -->
        ${itemsCardsHtml}

        <!-- Receipt Card -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px 18px; margin-top: 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
            Payment & Receipt
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-size: 13px; line-height: 1.7; border-collapse: collapse;">
            <tr>
              <td style="color: #64748B;">Items Subtotal</td>
              <td style="text-align: right; font-weight: 700; color: #1E293B;">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Delivery Fee</td>
              <td style="text-align: right; font-weight: 700; color: ${deliveryCharge === 0 ? '#16A34A' : '#1E293B'};">
                ${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
              </td>
            </tr>

            ${couponCode ? `
            <tr>
              <td style="padding: 6px 0; color: #B45309; font-weight: 700;">
                <span style="background: #FEF3C7; border: 1px solid #FCD34D; color: #92400E; padding: 3px 8px; border-radius: 6px; font-size: 11px;">
                  🏷️ Promo Code: <b>${couponCode}</b>
                </span>
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #DC2626; font-size: 14px;">
                -₹${discountAmount.toFixed(2)}
              </td>
            </tr>
            ` : ''}

            ${walletUsed > 0 ? `
            <tr>
              <td style="color: #16A34A; font-weight: 600;">Wallet Redeemed</td>
              <td style="text-align: right; font-weight: 800; color: #16A34A;">-₹${walletUsed.toFixed(2)}</td>
            </tr>
            ` : ''}

            ${coinsUsed > 0 ? `
            <tr>
              <td style="color: #16A34A; font-weight: 600;">Coins Redeemed</td>
              <td style="text-align: right; font-weight: 800; color: #16A34A;">-₹${coinsUsed.toFixed(2)}</td>
            </tr>
            ` : ''}

            ${order.taxAmount > 0 ? `
            <tr>
              <td style="color: #64748B; font-size: 12px;">Inclusive GST (5%)</td>
              <td style="text-align: right; color: #64748B; font-size: 12px;">₹${Number(order.taxAmount).toFixed(2)}</td>
            </tr>
            ` : ''}

            <tr>
              <td colspan="2" style="padding-top: 10px; border-top: 2px dashed #CBD5E1;"></td>
            </tr>

            <tr>
              <td style="font-size: 15px; font-weight: 900; color: #0F172A;">
                Total Amount Paid
              </td>
              <td style="text-align: right; font-size: 20px; font-weight: 900; color: #166534; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ₹${totalAmount.toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <!-- Pure Promise Note -->
        <div style="margin-top: 20px; padding: 14px 16px; background: #FFFDF0; border: 1px solid #FDE68A; border-radius: 12px; font-size: 12px; color: #78350F; line-height: 1.55;">
          <b>🌿 Pure Botanic Purity:</b> Your oil is 100% cold-pressed without heating, chemicals, or preservatives. You will receive an SMS and WhatsApp shipment tracking link as soon as your order is dispatched.
        </div>

        <!-- Tax Invoice Attached Notification -->
        <div style="margin-top: 14px; padding: 12px 14px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; font-size: 12px; color: #065F46; font-weight: 700; text-align: center;">
          📎 Official Tax Invoice Attached to this email (PDF)
        </div>

        <!-- Support Info -->
        <div style="margin-top: 22px; text-align: center; font-size: 12px; color: #64748B; line-height: 1.6;">
          Questions about your order? Reach us anytime:<br/>
          📧 <a href="mailto:contact@myownfresh.com" style="color: #166534; font-weight: 700; text-decoration: none;">contact@myownfresh.com</a> &nbsp;|&nbsp; 
          💬 <a href="https://wa.me/918999773438" target="_blank" style="color: #166534; font-weight: 700; text-decoration: none;">WhatsApp +91 89997 73438</a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #F8FAFC; padding: 16px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0;">
        © ${new Date().getFullYear()} OwnFresh Agro Industries. All rights reserved.
      </div>

    </div>
  </div>
</body>
</html>
  `;

  if (userEmail) {
    await transporter.sendMail({
      from: `"OwnFresh Orders" <${process.env.EMAIL}>`,
      to: userEmail,
      subject: `Order Confirmed - #${customId}`,
      html: customerHtml,
      attachments
    });
  }
};

/**
 * Dedicated Admin Order Notification Email
 * Always dispatched to contact@myownfresh.com for EVERY confirmed order (Online or COD)
 * Mobile-optimistic, modern, laptop-friendly with complete ledger, coupon info, and PhonePe settlement.
 */
export const sendAdminOrderNotificationMail = async (order) => {
  if (!order) return;

  const adminEmail = "contact@myownfresh.com";
  const customId = order.customOrderId || (order._id ? order._id.toString() : "UNKNOWN");
  const customerName = order.user?.fullName || order.deliveryAddress?.phone || "Customer";
  const customerEmail = order.user?.email || order.deliveryAddress?.email || "No email";
  const customerPhone = order.deliveryAddress?.phone || order.user?.mobile || "No phone";
  const deliveryAddress = order.deliveryAddress?.text || [
    order.deliveryAddress?.roomNumber,
    order.deliveryAddress?.areaName,
    order.deliveryAddress?.city,
    order.deliveryAddress?.state,
    order.deliveryAddress?.pincode
  ].filter(Boolean).join(", ") || "No address provided";

  const subtotal = (order.items || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const couponCode = order.couponCode ? order.couponCode.trim().toUpperCase() : null;
  const walletUsed = Number(order.walletDeductedAmount || 0);
  const coinsUsed = Number(order.commissionCoinsDeductedAmount || 0);
  const totalAmount = Number(order.totalAmount || 0);
  const paymentMethod = (order.PaymentMethod || "online").toUpperCase();
  const paymentStatus = (order.paymentStatus || "completed").toUpperCase();

  let attachments = [];
  try {
    const pdfBuffer = await generateInvoicePdf(order);
    attachments.push({
      filename: `Invoice_${customId.replace(/[\/\\]/g, '_')}.pdf`,
      content: pdfBuffer
    });
  } catch (pdfErr) {
    console.error("Failed to generate PDF attachment for admin order notification email:", pdfErr.message);
  }

  const orderTimeStr = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const siteUrl = "https://myownfresh.com";
  const adminUrl = "https://myownfresh.com/admin";
  const logoUrl = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";

  const itemsCardsHtml = (order.items || []).map((item) => `
    <div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          ${item.image ? `
          <td style="width: 54px; vertical-align: top; padding-right: 12px;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #E5E7EB; background: #fafafa; display: block;" />
          </td>
          ` : ''}
          <td style="vertical-align: top;">
            <div style="font-size: 14px; font-weight: 700; color: #111827; line-height: 1.35; margin-bottom: 4px;">
              ${cleanProductTitle(item.name, item.variantName)}
            </div>
            ${item.variantName ? `
            <div style="margin-bottom: 4px;">
              <span style="display: inline-block; background: #F1F5F9; color: #334155; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #E2E8F0;">
                Size: ${item.variantName}
              </span>
            </div>
            ` : ''}
            <div style="font-size: 12px; color: #64748B;">
              Qty: <b style="color: #111827;">${item.quantity}</b> × ₹${Number(item.price || 0).toFixed(2)}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 85px; padding-left: 6px;">
            <div style="font-size: 15px; font-weight: 900; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              ₹${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `).join('');

  const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>New Order #${customId}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F1F5F9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 8px !important; }
      .email-card { border-radius: 12px !important; }
      .header-pad { padding: 18px 16px !important; }
      .body-pad { padding: 16px 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <div class="email-wrapper" style="background-color: #F1F5F9; padding: 24px 12px; width: 100%; box-sizing: border-box;">
    <div class="email-card" style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
      
      <!-- Top Brand Header -->
      <div style="background: #ffffff; border-bottom: 1px solid #F1F5F9; padding: 16px 20px; text-align: center;">
        <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
          <img src="${logoUrl}" alt="OwnFresh" style="height: 42px; border: none; display: inline-block; vertical-align: middle;" />
        </a>
      </div>

      <!-- Hero Header Banner (Full-Width, Zero Horizontal Squeeze) -->
      <div class="header-pad" style="background: linear-gradient(135deg, #14532D 0%, #15803D 100%); padding: 24px 22px; color: #ffffff;">
        <div style="margin-bottom: 10px;">
          <span style="display: inline-block; background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
            ✨ NEW CUSTOMER ORDER
          </span>
        </div>
        <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.25; margin-bottom: 4px;">
          Order #${customId}
        </div>
        <div style="font-size: 12px; color: #D1E7D5; margin-bottom: 16px;">
          Placed on ${orderTimeStr} IST
        </div>

        <!-- Distinct Amount Card (100% Mobile & Laptop Safe - Never Squeezed) -->
        <div style="background: rgba(0, 0, 0, 0.28); border: 1px solid rgba(255, 255, 255, 0.22); border-radius: 12px; padding: 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #A7F3D0; font-weight: 800; margin-bottom: 4px;">
            Total Amount Received
          </div>
          <div style="font-size: 32px; font-weight: 900; color: #FFD700; line-height: 1.15; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.5px;">
            ₹${totalAmount.toFixed(2)}
          </div>
          <div style="margin-top: 10px;">
            <span style="display: inline-block; background: #059669; color: #ffffff; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #34D399; vertical-align: middle;">
              ✓ ${paymentStatus}
            </span>
            <span style="display: inline-block; background: rgba(255, 255, 255, 0.18); color: #ffffff; padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 6px; vertical-align: middle;">
              ${paymentMethod}
            </span>
          </div>
        </div>
      </div>

      <!-- Customer & Shipping Section (Stacked Full-Width Cards) -->
      <div style="padding: 16px 20px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
        
        <!-- Customer Profile Card -->
        <div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
            👤 Customer Information
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 8px;">
            ${customerName}
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-size: 13px; line-height: 1.6; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="padding: 3px 0; width: 65px; font-weight: 700; color: #64748B;">Email:</td>
              <td style="padding: 3px 0;">
                <a href="mailto:${customerEmail}" style="color: #2563EB; text-decoration: none; font-weight: 600; word-break: break-all;">${customerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 3px 0; font-weight: 700; color: #64748B;">Phone:</td>
              <td style="padding: 3px 0;">
                <a href="tel:${customerPhone}" style="color: #0F172A; text-decoration: none; font-weight: 700;">${customerPhone}</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Shipping Destination Card (Never cramped) -->
        <div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
            📍 Delivery Address
          </div>
          <div style="font-size: 13px; color: #1E293B; line-height: 1.6; font-weight: 500;">
            ${deliveryAddress}
          </div>
          ${order.deliveryMethod ? `<div style="margin-top: 8px; font-size: 11px; color: #059669; font-weight: 700;">🚚 Shipping Speed: ${order.deliveryMethod}</div>` : ''}
        </div>
      </div>

      <!-- Main Body: Items & Financial Breakdown -->
      <div class="body-pad" style="padding: 22px 20px;">
        
        <!-- Items Header -->
        <div style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          Purchased Products (${order.items?.length || 0})
        </div>

        <!-- Items List -->
        ${itemsCardsHtml}

        <!-- Financial Ledger Breakdown Card -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px 18px; margin-top: 16px;">
          <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
            Financial Summary
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-size: 13px; line-height: 1.7; border-collapse: collapse;">
            <tr>
              <td style="color: #64748B;">Items Subtotal</td>
              <td style="text-align: right; font-weight: 700; color: #1E293B;">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748B;">Delivery Fee</td>
              <td style="text-align: right; font-weight: 700; color: ${deliveryCharge === 0 ? '#16A34A' : '#1E293B'};">
                ${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
              </td>
            </tr>

            ${couponCode ? `
            <tr>
              <td style="padding: 6px 0; color: #B45309; font-weight: 700;">
                <span style="background: #FEF3C7; border: 1px solid #FCD34D; color: #92400E; padding: 3px 8px; border-radius: 6px; font-size: 11px;">
                  🏷️ Coupon: <b>${couponCode}</b>
                </span>
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #DC2626; font-size: 14px;">
                -₹${discountAmount.toFixed(2)}
              </td>
            </tr>
            ` : `
            <tr>
              <td style="color: #94A3B8; font-size: 12px;">Coupon / Promo Code</td>
              <td style="text-align: right; color: #94A3B8; font-size: 12px; font-style: italic;">None used</td>
            </tr>
            `}

            ${walletUsed > 0 ? `
            <tr>
              <td style="color: #16A34A; font-weight: 600;">Wallet Redeemed</td>
              <td style="text-align: right; font-weight: 800; color: #16A34A;">-₹${walletUsed.toFixed(2)}</td>
            </tr>
            ` : ''}

            ${coinsUsed > 0 ? `
            <tr>
              <td style="color: #16A34A; font-weight: 600;">Coins Redeemed</td>
              <td style="text-align: right; font-weight: 800; color: #16A34A;">-₹${coinsUsed.toFixed(2)}</td>
            </tr>
            ` : ''}

            ${order.taxAmount > 0 ? `
            <tr>
              <td style="color: #64748B; font-size: 12px;">Inclusive GST (5%)</td>
              <td style="text-align: right; color: #64748B; font-size: 12px;">₹${Number(order.taxAmount).toFixed(2)}</td>
            </tr>
            ` : ''}

            <tr>
              <td colspan="2" style="padding-top: 10px; border-top: 2px dashed #CBD5E1;"></td>
            </tr>

            <tr>
              <td style="font-size: 15px; font-weight: 900; color: #0F172A;">
                Net Amount Received
              </td>
              <td style="text-align: right; font-size: 20px; font-weight: 900; color: #166534; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ₹${totalAmount.toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <!-- Payment Gateway Settlement Details Card -->
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 14px 16px; margin-top: 16px;">
          <div style="font-weight: 800; color: #1E3A8A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            💳 PhonePe Settlement Information
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-size: 12px; color: #1E40AF; border-collapse: collapse; line-height: 1.6;">
            <tr>
              <td style="padding: 2px 0; width: 110px; color: #60A5FA; font-weight: 600;">Gateway:</td>
              <td style="padding: 2px 0; font-weight: 700; color: #1E3A8A;">PhonePe Business (PG Checkout)</td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #60A5FA; font-weight: 600;">Payment Status:</td>
              <td style="padding: 2px 0; font-weight: 800; color: #059669;">✓ ${paymentStatus}</td>
            </tr>
            ${order.phonePeTransactionId ? `
            <tr>
              <td style="padding: 2px 0; color: #60A5FA; font-weight: 600;">Transaction ID:</td>
              <td style="padding: 2px 0;">
                <code style="background: #DBEAFE; color: #1E3A8A; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; word-break: break-all;">${order.phonePeTransactionId}</code>
              </td>
            </tr>
            ` : ''}
            ${order.phonePeOrderId ? `
            <tr>
              <td style="padding: 2px 0; color: #60A5FA; font-weight: 600;">PhonePe Order ID:</td>
              <td style="padding: 2px 0;">
                <code style="background: #DBEAFE; color: #1E3A8A; padding: 2px 6px; border-radius: 4px; font-size: 11px; word-break: break-all;">${order.phonePeOrderId}</code>
              </td>
            </tr>
            ` : ''}
            ${order.phonePeUtr ? `
            <tr>
              <td style="padding: 2px 0; color: #60A5FA; font-weight: 600;">Bank UTR / UPI:</td>
              <td style="padding: 2px 0;">
                <code style="background: #DBEAFE; color: #1E3A8A; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; word-break: break-all;">${order.phonePeUtr}</code>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 2px 0; color: #60A5FA; font-weight: 600;">Merchant Order Ref:</td>
              <td style="padding: 2px 0;">
                <code style="background: #DBEAFE; color: #1E3A8A; padding: 2px 6px; border-radius: 4px; font-size: 11px; word-break: break-all;">${order.phonePeMerchantTransactionId || order._id}</code>
              </td>
            </tr>
          </table>
        </div>

        <!-- PDF Invoice Attached Notification Badge -->
        <div style="margin-top: 16px; padding: 12px 14px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; font-size: 12px; color: #065F46; font-weight: 700; text-align: center;">
          📎 Official Tax Invoice Attached to this email (PDF)
        </div>

        <!-- CTA Button -->
        <div style="margin-top: 22px; text-align: center;">
          <a href="${adminUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; padding: 14px 20px; background: #166534; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; box-shadow: 0 4px 10px rgba(22, 101, 52, 0.25);">
            Open Admin Orders Panel →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #F8FAFC; padding: 16px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0;">
        OwnFresh Agro Industries • Automated Operational Dispatch to contact@myownfresh.com
      </div>

    </div>
  </div>
</body>
</html>
  `;

  const subject = `🛒 [NEW ORDER] #${customId} - ₹${totalAmount.toFixed(2)} | ${customerName} ${couponCode ? `(Coupon: ${couponCode})` : ''}`;

  await transporter.sendMail({
    from: `"OwnFresh Orders" <${process.env.EMAIL}>`,
    to: adminEmail,
    subject,
    html: adminHtml,
    attachments
  });
};

export const sendCustomMail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: `"OwnFresh Support" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
    text
  });
};

export const generateShipmentEmailHtml = (order, trackingUrl) => {
  const customerName = order.user?.fullName || "Customer";
  const siteUrl = process.env.FRONTEND_URL || "https://myownfresh.com";
  const isLocal = order.isLocalDelivery || 
                  (order.courierPartner && (order.courierPartner.toLowerCase().includes("local") || order.courierPartner.toLowerCase().includes("pune"))) ||
                  order.trackingId === "PUNE" ||
                  order.trackingId === "LOCAL-PUNE" ||
                  (order.deliveryAddress && (
                    (order.deliveryAddress.areaName && order.deliveryAddress.areaName.toLowerCase().includes("pune")) ||
                    (order.deliveryAddress.text && order.deliveryAddress.text.toLowerCase().includes("pune"))
                  ));

  return `
      <div style="background-color:#FFFDF2;padding:24px;font-family:Arial,sans-serif;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <div style="background:#ffffff;border-bottom:1px solid #E5E5E5;padding:16px;text-align:center;">
            <a href="${siteUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
              <img src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" alt="OwnFresh Logo" style="height:44px;border:none;display:inline-block;vertical-align:middle;" />
            </a>
          </div>
          <!-- Body -->
          <div style="padding:24px;color:#333;">
            <h2 style="margin-top:0;color:#24672E;">${isLocal ? "Your Order is Out for Local Delivery!" : "Your Order is on the Way!"}</h2>
            <p style="font-size:14px;color:#555;">
              Hi <b>${customerName}</b>,
            </p>
            <p style="font-size:14px;color:#555;line-height:1.5;">
              Exciting news! Your order <b>#${order.customOrderId || order._id.toString().toUpperCase()}</b> has been handed over to ${isLocal ? "our <b>Local Pune Delivery Fleet</b>" : `our courier partner <b>${order.courierPartner}</b>`}.
            </p>
            <!-- Tracking Details -->
            <div style="margin:24px 0;padding:16px;background:#F5F5F5;border-radius:8px;border:1px solid #E5E5E5;">
              <p style="margin:0 0 8px 0;font-size:14px;"><b>Delivery Mode:</b> ${order.courierPartner || "Local Pune Delivery"}</p>
              ${!isLocal && order.trackingId ? `<p style="margin:0 0 16px 0;font-size:14px;"><b>AWB/Tracking Number:</b> ${order.trackingId}</p>` : ''}
              
              ${isLocal ? `
              <div style="margin: 0 0 10px 0; padding: 12px; background: #ffffff; border-radius: 6px; border: 1px dashed #24672E; font-size: 13px; color: #24672E; line-height: 1.5; text-align: left;">
                <b>Local Pune Delivery:</b> Our delivery executive is en route to deliver fresh, pure cold-pressed oil directly to your doorstep. No courier tracking number is required.
              </div>
              ` : `
              <!-- Instructions -->
              <div style="margin: 0 0 20px 0; padding: 12px; background: #ffffff; border-radius: 6px; border: 1px dashed #cccccc; font-size: 13px; color: #555; line-height: 1.5; text-align: left;">
                <b style="color: #24672E; display: block; margin-bottom: 6px;">How to track your shipment:</b>
                <ol style="margin: 0; padding-left: 20px;">
                  <li>Copy the <b>AWB/Tracking Number</b> above.</li>
                  <li>Click the <b>Track Package</b> button below.</li>
                  <li>Paste the AWB number on the tracking page to get your details.</li>
                </ol>
              </div>

              ${trackingUrl ? `
              <div style="text-align:center;">
                <a href="${trackingUrl}" target="_blank" style="
                  display:inline-block;
                  padding:12px 24px;
                  font-size:14px;
                  font-weight:bold;
                  background:#FFD700;
                  color:#000;
                  border-radius:8px;
                  text-decoration:none;
                  border:1px solid #E5E5E5;
                ">
                  Track Package →
                </a>
              </div>
              ` : ''}
              `}
            </div>
            <p style="font-size:14px;color:#555;">
              📅 <b>Expected Delivery:</b> ${isLocal ? "Today or within 24-48 hours within Pune." : "You should receive your items within 3-5 business days."}
            </p>
            <p style="font-size:13px;color:#777;margin-top:16px;">
              If you have any questions or concerns, contact our support team at <a href="mailto:contact@myownfresh.com" style="color:#24672E;text-decoration:none;">contact@myownfresh.com</a>.
            </p>
            <p style="font-size:13px;color:#777;margin-top:8px;">
              You can read our <a href="${siteUrl}/refund-policy" target="_blank" style="color:#24672E;text-decoration:none;font-weight:bold;">Return & Refund Policy here</a>.
            </p>
          </div>
          <!-- Footer -->
          <div style="background:#F5F5F5;padding:12px;text-align:center;font-size:12px;color:#777;">
            © ${new Date().getFullYear()} OwnFresh. All rights reserved.
          </div>
        </div>
      </div>
  `;
};

export const generateDeliverySuccessEmailHtml = (order) => {
  const isPune = order.isLocalDelivery ||
                 (order.courierPartner && (order.courierPartner.toLowerCase().includes("local") || order.courierPartner.toLowerCase().includes("pune"))) ||
                 order.trackingId === "PUNE" ||
                 order.trackingId === "LOCAL-PUNE" ||
                 (order.deliveryAddress && (
                   (order.deliveryAddress.city && order.deliveryAddress.city.toLowerCase().includes("pune")) ||
                   (order.deliveryAddress.areaName && order.deliveryAddress.areaName.toLowerCase().includes("pune")) ||
                   (order.deliveryAddress.text && order.deliveryAddress.text.toLowerCase().includes("pune"))
                 ));

  const customerName = order.user?.fullName || "Valued Customer";
  const siteUrl = process.env.FRONTEND_URL || "https://myownfresh.com";
  const orderId = order.customOrderId || (order._id ? order._id.toString().toUpperCase() : "ORDER");
  const deliveryAddress = order.deliveryAddress?.text || [
    order.deliveryAddress?.roomNumber,
    order.deliveryAddress?.areaName,
    order.deliveryAddress?.city,
    order.deliveryAddress?.pincode
  ].filter(Boolean).join(", ") || "Pune, Maharashtra";

  const deliveredDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #EEEEEE; vertical-align: middle;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 46px; height: 46px; object-fit: cover; border-radius: 8px; margin-right: 12px; vertical-align: middle; display: inline-block; border: 1px solid #E5E5E5;" />` : ''}
        <div style="display: inline-block; vertical-align: middle;">
          <span style="font-weight: 700; font-size: 13px; color: #222222;">${item.name}</span>
          ${item.variantName ? `<span style="font-size: 11px; color: #666666; display: block; margin-top: 2px;">Variant: ${item.variantName}</span>` : ''}
        </div>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #EEEEEE; text-align: center; font-size: 13px; color: #555555; font-weight: 600;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #EEEEEE; text-align: right; font-size: 13px; font-weight: 800; color: #222222;">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="background-color:#FFFDF2;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:540px;margin:auto;background:#ffffff;border:1px solid #E5E5E5;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.06);">
        
        <!-- Header with Logo & Order ID -->
        <div style="background:#ffffff;border-bottom:1px solid #EAEAEA;padding:18px 24px;text-align:center;">
          <a href="${siteUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
            <img src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" alt="OwnFresh Logo" style="height:48px;border:none;display:inline-block;vertical-align:middle;" />
          </a>
          <div style="margin-top:10px;">
            <span style="display:inline-block;background:#FFF9DB;border:1px solid #FFE066;color:#5C4300;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;">
              Order ID: #${orderId}
            </span>
          </div>
        </div>

        <!-- Hero Banner -->
        <div style="background: linear-gradient(135deg, #24672E 0%, #17421D 100%); padding: 26px 20px; text-align: center; color: #ffffff;">
          <div style="font-size: 34px; line-height: 1; margin-bottom: 8px;">🥰</div>
          <h1 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">Order Delivered Successfully!</h1>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.92;">Pure, stone-pressed freshness at your doorstep</p>
        </div>

        <!-- Body Message -->
        <div style="padding:28px 24px;color:#333333;">
          <p style="font-size:17px;font-weight:700;color:#111111;margin-top:0;margin-bottom:14px;">
            Hi ${customerName},
          </p>

          <p style="font-size:18px;font-weight:800;color:#24672E;line-height:1.4;margin:14px 0 8px 0;">
            Your OwnFresh oil has been delivered successfully! 🥰
          </p>

          <p style="font-size:16px;font-weight:700;color:#C62828;margin:0 0 22px 0;">
            Thank you for choosing OwnFresh! ❤️
          </p>

          ${isPune ? `
          <!-- Pune Local Dedicated Delivery Callout -->
          <div style="margin: 18px 0; padding: 14px 18px; background: #F1F8E9; border-left: 4px solid #24672E; border-radius: 8px; font-size: 13px; color: #2E7D32; line-height: 1.5;">
            🛵 <b>OwnFresh Direct Pune Express:</b> Hand-delivered fresh directly to your doorstep in Pune with zero courier delays!
          </div>
          ` : ''}

          <!-- Delivery Information Card -->
          <div style="background:#F7F9F7;border:1px solid #D8E5D8;border-radius:12px;padding:18px;margin:22px 0;font-size:13px;line-height:1.7;">
            <div style="margin-bottom:6px;"><b>📦 Order ID:</b> <span style="font-family:monospace;font-weight:700;color:#24672E;">#${orderId}</span></div>
            <div style="margin-bottom:6px;"><b>📍 Delivered To:</b> ${deliveryAddress}</div>
            <div style="margin-bottom:6px;"><b>📅 Delivery Date:</b> ${deliveredDate}</div>
            <div style="margin-bottom:6px;">
              <b>🚚 Delivery Mode:</b> 
              ${isPune 
                ? `<span style="display:inline-block;background:#E8F5E9;color:#1B5E20;border:1px solid #A5D6A7;padding:3px 10px;border-radius:8px;font-size:12px;font-weight:700;">🛵 OwnFresh Direct Express (Pune Local Fleet)</span>`
                : `<span style="font-weight:700;color:#222222;">${order.courierPartner || "Standard Express Courier"}</span>`
              }
            </div>
            <div><b>💳 Payment:</b> ${order.PaymentMethod ? order.PaymentMethod.toUpperCase() : "PAID"} (₹${(order.totalAmount || 0).toFixed(2)})</div>
          </div>

          <!-- Items in Delivery Table -->
          <h3 style="font-size:13px;color:#24672E;text-transform:uppercase;letter-spacing:1px;font-weight:800;margin:24px 0 10px;">Delivered Items</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:22px;border:1px solid #EEEEEE;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#F5F5F5;font-size:11px;text-transform:uppercase;color:#666666;font-weight:700;">
                <th style="padding:10px 12px;text-align:left;">Item</th>
                <th style="padding:10px 12px;text-align:center;width:50px;">Qty</th>
                <th style="padding:10px 12px;text-align:right;width:85px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Tax Invoice & Order Link -->
          <div style="text-align:center;margin:28px 0 20px;">
            <a href="${siteUrl}/my-orders" target="_blank" style="
              display:inline-block;
              padding:14px 30px;
              font-size:13px;
              font-weight:800;
              background:#FFD700;
              color:#000000;
              border-radius:10px;
              text-decoration:none;
              text-transform:uppercase;
              letter-spacing:0.5px;
              box-shadow:0 3px 10px rgba(0,0,0,0.08);
            ">
              View Order & Download Tax Invoice →
            </a>
          </div>

          <!-- Review & Feedback Callout -->
          <div style="background:#FFF9E6;border:1px solid #FFE699;border-radius:10px;padding:16px;margin-top:22px;text-align:center;font-size:13px;color:#7A5E00;line-height:1.5;">
            🌿 <b>Loving the taste of stone-pressed purity?</b><br />
            We would truly appreciate your rating and review on our website!
          </div>

          <!-- Support Contact -->
          <p style="font-size:13px;color:#666666;margin-top:24px;line-height:1.5;">
            Have questions about this delivery or need support? Simply reply directly to this email or write to us at <a href="mailto:contact@myownfresh.com" style="color:#24672E;text-decoration:none;font-weight:700;">contact@myownfresh.com</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#F5F5F5;padding:16px;text-align:center;font-size:12px;color:#777777;border-top:1px solid #EEEEEE;line-height:1.6;">
          <p style="margin:0 0 4px 0;"><b>OwnFresh Agro Industries</b> — Pune, Maharashtra</p>
          <p style="margin:0;">© ${new Date().getFullYear()} OwnFresh. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

export const sendOrderDeliveredMail = async ({ to, subject, html, text }) => {
  return await transporter.sendMail({
    from: `"OwnFresh Deliveries" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
    text
  });
};

