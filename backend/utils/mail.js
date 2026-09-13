import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateInvoicePdf } from "./pdfGenerator.js";

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
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #EEE;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 10px; vertical-align: middle;" />
        <span style="font-weight: bold; vertical-align: middle;">${item.name}</span>
        ${item.variantName ? `<span style="font-size: 12px; color: #777; display: block; margin-left: 60px;">Variant: ${item.variantName}</span>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  let attachments = [];
  try {
    const pdfBuffer = await generateInvoicePdf(order);
    attachments.push({
      filename: `Invoice_${order.customOrderId || order._id}.pdf`,
      content: pdfBuffer
    });
  } catch (pdfErr) {
    console.error("Failed to generate PDF attachment for email:", pdfErr.message);
  }

  await transporter.sendMail({
    from: `"OwnFresh Orders" <${process.env.EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmed - #${order.customOrderId || order._id}`,
    html: `
      <div style="background-color:#F9F9F9;padding:24px;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background:#FFD700;padding:20px;text-align:center;">
            <h1 style="margin:0;color:#000;font-size:24px;text-transform:uppercase;letter-spacing:2px;">Order Confirmed!</h1>
            <p style="margin:5px 0 0 0;color:#333;font-size:14px;">Thank you for shopping with OwnFresh</p>
          </div>

          <!-- Body -->
          <div style="padding:32px;color:#333;">
            <p style="font-size:16px;margin-top:0;">Hi <b>${order.user.fullName}</b>,</p>
            <p style="font-size:14px;color:#555;line-height:1.5;">
              We've received your order and payment. We have attached the official tax invoice to this email. Below are your order details:
            </p>

            <div style="background:#F5F5F5;padding:15px;border-radius:8px;margin:20px 0;font-size:14px;">
              <b>Order ID:</b> #${order.customOrderId || order._id}<br/>
              <b>Payment Method:</b> ${order.PaymentMethod.toUpperCase()} (Online / UPI)<br/>
              <b>Delivery Address:</b> ${order.deliveryAddress.text}
            </div>

            <!-- Items Table -->
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
              <thead>
                <tr style="background:#EEE;">
                  <th style="padding:10px;text-align:left;">Item</th>
                  <th style="padding:10px;text-align:center;width:60px;">Qty</th>
                  <th style="padding:10px;text-align:right;width:100px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Totals -->
            <table style="width:100%;font-size:14px;line-height:1.6;margin-top:10px;">
              ${order.discountAmount > 0 ? `
              <tr>
                <td style="text-align:right;color:#777;">Discount:</td>
                <td style="text-align:right;width:120px;color:red;">-₹${order.discountAmount.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${order.taxAmount > 0 ? `
              <tr>
                <td style="text-align:right;color:#777;">GST:</td>
                <td style="text-align:right;width:120px;">₹${order.taxAmount.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${order.walletDeductedAmount > 0 ? `
              <tr>
                <td style="text-align:right;color:#777;">Wallet Used:</td>
                <td style="text-align:right;width:120px;color:green;">-₹${order.walletDeductedAmount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="font-size:16px;font-weight:bold;">
                <td style="text-align:right;padding-top:10px;">Total Amount Paid:</td>
                <td style="text-align:right;width:120px;padding-top:10px;border-top:1px solid #333;">₹${order.totalAmount.toFixed(2)}</td>
              </tr>
            </table>

            <p style="font-size:14px;color:#555;margin-top:30px;line-height:1.5;">
              If you have any questions or concerns regarding your order, feel free to reply directly to this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#F5F5F5;padding:15px;text-align:center;font-size:12px;color:#777;">
            © ${new Date().getFullYear()} OwnFresh. All rights reserved.
          </div>

        </div>
      </div>
    `,
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

