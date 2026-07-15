import React from 'react';
import { motion } from 'framer-motion';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20 text-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100"
      >
        <h1 className="text-4xl font-black text-black mb-2">Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: July 15, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Order Cancellations</h2>
            <p>
              You can cancel your order at any time before it has been packaged and dispatched. To cancel an order, 
              please reach out to us immediately at our support email (<span className="font-semibold text-yellow-600">my1ownfresh@gmail.com</span>) 
              or call us at <span className="font-semibold">+91 9689889191</span>. 
              Once the package has been dispatched to our courier partner, the order cannot be canceled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Returns Policy</h2>
            <p>
              Due to the perishable and consumable nature of our stone-pressed edible oils and botanical products, 
              we generally do not accept product returns. 
              However, we are committed to client satisfaction. We will process returns or replacements under the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>The product received is physically damaged or has leaked during transit.</li>
              <li>The product received is different from what was ordered (incorrect item).</li>
              <li>The product has expired before delivery.</li>
            </ul>
            <p className="mt-3">
              To request a return or replacement, you must contact our support within <strong className="text-black">48 hours</strong> of receiving the package, 
              along with a clear photo or video proof showing the damage or mismatch.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. Refund Processing and Timelines</h2>
            <p>
              Once your refund request is verified and approved by our support team, the refund will be initiated automatically. 
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li><strong className="text-black">Mode of Refund:</strong> All refunds are credited directly back to the original payment source (credit card, debit card, UPI, net banking, or wallet) used to place the order.</li>
              <li><strong className="text-black">Processing Timeline:</strong> The refund amount will reflect in your account within <strong className="text-black">5 to 7 business days</strong>, depending on your bank's processing cycles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Out-of-Stock Items</h2>
            <p>
              In rare instances where a product you purchased becomes out of stock after order placement, we will contact you immediately. 
              You can choose to wait for restocking, swap the item for an alternative, or receive an immediate, full refund back to your original payment source.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-black mb-3">5. Support Contact</h2>
            <p>If you have any queries regarding refunds, returns, or order cancellations, please reach out to us:</p>
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

export default RefundPolicy;
