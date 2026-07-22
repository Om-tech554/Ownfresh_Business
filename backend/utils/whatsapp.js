import axios from "axios";

/**
 * Sends order confirmation message to the customer's WhatsApp number
 * @param {Object} order - The populated Order document (with populated user info)
 */
export const sendOrderConfirmationWhatsApp = async (order) => {
  try {
    const phoneNumber = order.deliveryAddress?.phone || order.user?.mobile;
    const customerName = order.user?.fullName || "Valued Customer";
    const orderId = order.customOrderId || order._id;
    const totalAmount = order.totalAmount.toFixed(2);
    const paymentMethodText = order.PaymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";
    
    if (!phoneNumber) {
      console.log(`⚠️ WhatsApp skipped: No phone number found for order #${orderId}`);
      return;
    }

    // Format phone number to E.164 (without '+' for some providers, but Twilio needs '+' prefixed)
    // Clean any spaces, hyphens, etc.
    let cleanPhone = phoneNumber.replace(/[\s\-()]/g, "");
    // Ensure country code is present (default to India +91 if length is 10 digits)
    if (cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = `+${cleanPhone}`;
    }

    const walletDeductedAmount = order.walletDeductedAmount || 0;
    let walletInfo = "";
    if (walletDeductedAmount > 0) {
      walletInfo = `\n• Paid via Wallet: ₹${walletDeductedAmount.toFixed(2)}`;
    }

    const frontendUrl = process.env.FRONTEND_URL || "https://frontend-ownfresh.onrender.com";
    const trackingLink = `${frontendUrl}/order-success?orderId=${orderId}`;

    const message = `Hi ${customerName},

Thank you for shopping with OwnFresh! 🌿
Your order *#${orderId}* has been successfully placed.

*Order Summary:*
• Total Amount: ₹${totalAmount}${walletInfo}
• Payment Method: ${paymentMethodText}

We are preparing your fresh goods for delivery. You can track your order status here:
${trackingLink}

Thank you!
*OwnFresh Team*`;

    const provider = (process.env.WHATSAPP_PROVIDER || "none").toLowerCase();

    console.log(`💬 [WHATSAPP LOG] Preparing to send via provider "${provider}" to ${cleanPhone}:`);
    console.log(`----------------------------------------\n${message}\n----------------------------------------`);

    if (provider === "twilio") {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER || "+14155238886"; // Default Twilio Sandbox number

      if (!accountSid || !authToken) {
        console.warn("⚠️ Twilio credentials missing in environment variables. Message only logged.");
        return;
      }

      // Format from number correctly
      const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
      const formattedTo = `whatsapp:${cleanPhone}`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("From", formattedFrom);
      params.append("To", formattedTo);
      params.append("Body", message);

      await axios.post(twilioUrl, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authHeader}`,
        },
      });

      console.log(`✅ WhatsApp sent successfully to ${cleanPhone} via Twilio`);

    } else if (provider === "meta") {
      const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
      const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;

      if (!phoneNumberId || !accessToken) {
        console.warn("⚠️ Meta WhatsApp Cloud API credentials missing in environment variables. Message only logged.");
        return;
      }

      const metaUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

      // Official WhatsApp Cloud API requires template messages for business-initiated conversations.
      // We will try sending a text message first, but user should configure templates in Meta Business Manager.
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: true,
          body: message
        }
      };

      await axios.post(metaUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(`✅ WhatsApp sent successfully to ${cleanPhone} via Meta Cloud API`);
    } else {
      console.log(`ℹ️ WhatsApp notification simulation complete (Provider set to "none" or not configured).`);
    }

  } catch (error) {
    console.error("❌ Failed to send WhatsApp notification:", error.response?.data || error.message);
  }
};
