import React from 'react';
import { motion } from 'framer-motion';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20 text-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100"
      >
        <h1 className="text-4xl font-black text-black mb-2">Shipping & Delivery Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: July 15, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Order Processing Time</h2>
            <p>
              We want to ensure your stone-pressed oils and organic botanical products reach you fresh. All orders are processed, 
              packaged, and dispatched within <strong className="text-black">24 to 48 business hours</strong> of order placement. 
              Orders placed on Sundays or public holidays will be dispatched on the next working day.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Delivery Timelines</h2>
            <p>
              We deliver to addresses across India. Once your order has been dispatched, the estimated delivery time is:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li><strong className="text-black">Standard Delivery:</strong> 3 to 5 business days from the date of dispatch.</li>
              <li><strong className="text-black">Local Deliveries (Pune Region):</strong> 1 to 2 business days from the date of dispatch.</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              *Please note: Delivery timelines are estimates. Occasional delays may occur due to logistics issues, weather conditions, or local holidays.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. Shipping Charges</h2>
            <p>
              Shipping fees are calculated at checkout based on the weight of the items and the destination pincode. 
              We offer free standard shipping on orders above a specified threshold, which is dynamically highlighted during your checkout process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Order Tracking</h2>
            <p>
              Once your package is shipped, you will receive an email and WhatsApp/SMS confirmation containing your unique tracking link and tracking ID. 
              You can track your package directly via our logistics partner's website or check your order history inside your OwnFresh account profile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Damaged or Non-Delivery Issues</h2>
            <p>
              If your package is damaged during shipment or fails to deliver, please contact us immediately. We will investigate with the shipping partner 
              and arrange a replacement or refund as per our Refund Policy.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-black mb-3">6. Support Contact</h2>
            <p>For any questions or support regarding shipping, please contact us:</p>
            <div className="mt-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
              <p className="font-semibold text-black">OwnFresh Support Desk</p>
              <p>Email: <a href="mailto:my1ownfresh@gmail.com" className="text-yellow-600 hover:underline">my1ownfresh@gmail.com</a></p>
              <p>Phone: +91 9689889191</p>
              <p>Address: Dhayari, Pune, Maharashtra, India</p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default ShippingPolicy;
