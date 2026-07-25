import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ShippingPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20 text-gray-700 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-black transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:shadow"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-semibold">Back</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 mt-6"
      >
        <h1 className="text-3xl md:text-4xl font-black text-black mb-2">Shipping Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: July 22, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <p className="text-gray-600 font-medium">
            At MyOwnFresh, we are committed to delivering fresh and quality products safely and on time. This Shipping Policy explains how we process, dispatch, and deliver your orders.
          </p>

          <section className="pt-4">
            <h2 className="text-xl font-bold text-black mb-3">1. Business Information</h2>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm space-y-2">
              <p><b>Trade Name:</b> MyOwnFresh</p>
              <p><b>Legal Business Name:</b> OWNFRESH AGRO INDUSTRIES</p>
              <p>
                <b>Registered Address:</b> Ground Floor, Shed No. 1, Vir Maruti Complex, 30/13 Dhayari, Vadgaon Budruk, Pune, Maharashtra – 411041, India
              </p>
              <p><b>Phone:</b> +91 9689889191</p>
              <p><b>Email:</b> <a href="mailto:contact@myownfresh.com" className="text-yellow-600 hover:underline">contact@myownfresh.com</a></p>
              <p><b>Website:</b> <a href="https://myownfresh.com/" className="text-yellow-600 hover:underline">https://myownfresh.com/</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Order Processing</h2>
            <p>
              Orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. Shipping Coverage</h2>
            <p>
              We currently deliver to serviceable locations across India. Delivery availability depends on the customer's pin code and our courier partners' service network.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Delivery Timeline</h2>
            <p>
              Orders are generally delivered within 5–7 business days from the date of dispatch. Delivery timelines may vary depending on your location, courier operations, weather conditions, or other unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Shipping Charges</h2>
            <p>
              Applicable shipping charges, if any, will be displayed during checkout before payment. Free shipping offers may be available on selected products or promotional campaigns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Order Tracking</h2>
            <p>
              Once your order is dispatched, tracking details will be shared via email, SMS, or WhatsApp (where applicable), enabling you to track your shipment until delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">7. Delivery Attempts</h2>
            <p>
              Our courier partners will make reasonable attempts to deliver your order. If delivery fails due to an incorrect address, customer unavailability, or refusal to accept the shipment, additional shipping or re-delivery charges may apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">8. Delivery Delays</h2>
            <p>
              While we strive to deliver within the estimated timeframe, delays caused by courier partners, weather conditions, public holidays, natural disasters, or other events beyond our control may occur. MyOwnFresh shall not be liable for such delays.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-black mb-3">9. Contact Us</h2>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm space-y-1">
              <p className="font-bold text-black text-base">MyOwnFresh</p>
              <p className="font-semibold text-gray-700">OWNFRESH AGRO INDUSTRIES</p>
              <p>Ground Floor, Shed No. 1, Vir Maruti Complex, 30/13 Dhayari, Vadgaon Budruk, Pune, Maharashtra – 411041, India</p>
              <p className="pt-2"><b>Phone:</b> +91 9689889191</p>
              <p><b>Email:</b> <a href="mailto:contact@myownfresh.com" className="text-yellow-600 hover:underline">contact@myownfresh.com</a></p>
              <p><b>Website:</b> <a href="https://myownfresh.com/" className="text-yellow-600 hover:underline">https://myownfresh.com/</a></p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default ShippingPolicy;
