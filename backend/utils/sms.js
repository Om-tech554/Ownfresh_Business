/**
 * OwnFresh SMS/WhatsApp Notification Utility
 * 
 * You can configure this to use your preferred SMS/WhatsApp provider (e.g., Twilio, Fast2SMS, Gupshup, etc.)
 */

/**
 * Sends order confirmation message to the customer
 * @param {Object} order - The populated Order document
 */
export const sendOrderConfirmationSms = async (order) => {
  try {
    const phoneNumber = order.deliveryAddress.phone || order.user.mobile;
    const customerName = order.user.fullName;
    const orderId = order.customOrderId || order._id;
    const totalAmount = order.totalAmount.toFixed(2);

    if (!phoneNumber) {
      console.log(`⚠️ SMS skipped: No phone number found for order #${orderId}`);
      return;
    }

    const message = `Hi ${customerName}, your OwnFresh order #${orderId} has been confirmed! Total Paid: ₹${totalAmount}. We are preparing your fresh goods for delivery. Thank you!`;

    console.log(`💬 [SMS LOG] Sending notification to ${phoneNumber}: "${message}"`);

    // ========================================================
    // OPTION 1: Integration with Fast2SMS (Indian SMS Provider)
    // ========================================================
    /*
    import axios from "axios";
    if (process.env.FAST2SMS_API_KEY) {
      await axios.post("https://www.fast2sms.com/dev/bulkV2", {
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: phoneNumber,
      }, {
        headers: {
          "authorization": process.env.FAST2SMS_API_KEY
        }
      });
      console.log(`✅ SMS sent successfully to ${phoneNumber} via Fast2SMS`);
    }
    */

    // ========================================================
    // OPTION 2: Integration with Twilio
    // ========================================================
    /*
    import twilio from "twilio";
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`
      });
      console.log(`✅ SMS sent successfully to ${phoneNumber} via Twilio`);
    }
    */

  } catch (error) {
    console.error("❌ Failed to send SMS/WhatsApp notification:", error.message);
  }
};
