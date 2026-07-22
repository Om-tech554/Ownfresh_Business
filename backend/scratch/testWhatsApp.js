import dotenv from "dotenv";
import { sendOrderConfirmationWhatsApp } from "../utils/whatsapp.js";

dotenv.config();

const mockOrder = {
  _id: "66123abc456def7890123456",
  totalAmount: 1250.50,
  walletDeductedAmount: 150.00,
  PaymentMethod: "cod",
  deliveryAddress: {
    phone: "9876543210"
  },
  user: {
    fullName: "John Doe",
    mobile: "9876543210"
  }
};

const test = async () => {
  console.log("🚀 Testing sendOrderConfirmationWhatsApp with mock order...");
  await sendOrderConfirmationWhatsApp(mockOrder);
  console.log("🏁 Test completed!");
};

test();
