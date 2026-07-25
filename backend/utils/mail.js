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
              We've received your order and payment. We are preparing the items for shipment! Below are your order details:
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
  return `
      <div style="background-color:#FFFDF2;padding:24px;font-family:Arial,sans-serif;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <div style="background:#24672E;padding:16px;text-align:center;">
            <h1 style="margin:0;color:#FFF;font-size:22px;">OwnFresh</h1>
          </div>
          <!-- Body -->
          <div style="padding:24px;color:#333;">
            <h2 style="margin-top:0;color:#24672E;">Your Order is on the Way!</h2>
            <p style="font-size:14px;color:#555;">
              Hi <b>${customerName}</b>,
            </p>
            <p style="font-size:14px;color:#555;line-height:1.5;">
              Exciting news! Your order <b>#${order.customOrderId || order._id.toString().toUpperCase()}</b> has been handed over to our courier partner <b>${order.courierPartner}</b>.
            </p>
            <!-- Tracking Details -->
            <div style="margin:24px 0;padding:16px;background:#F5F5F5;border-radius:8px;border:1px solid #E5E5E5;">
              <p style="margin:0 0 8px 0;font-size:14px;"><b>Courier:</b> ${order.courierPartner}</p>
              <p style="margin:0 0 16px 0;font-size:14px;"><b>AWB/Tracking Number:</b> ${order.trackingId}</p>
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
            </div>
            <p style="font-size:14px;color:#555;">
              📅 <b>Expected Delivery:</b> You should receive your items within 5-7 business days.
            </p>
            <p style="font-size:13px;color:#777;margin-top:16px;">
              If you have any questions or concerns, contact our support team at <a href="mailto:contact@myownfresh.com" style="color:#24672E;text-decoration:none;">contact@myownfresh.com</a>.
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
