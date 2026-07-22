import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RefundPolicy = () => {
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
        <h1 className="text-3xl md:text-4xl font-black text-black mb-2">Return, Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: July 22, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <p className="text-gray-600 font-medium">
            At MyOwnFresh, we are committed to providing high-quality products and ensuring customer satisfaction. If you are not completely satisfied with your purchase, you may request a return subject to the following terms and conditions.
          </p>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Return Window</h2>
            <p>
              Customers may request a return within 7 days from the date of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Eligibility for Return</h2>
            <p className="mb-2">A return request may be approved if:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>The wrong product was delivered.</li>
              <li>The product was damaged or defective.</li>
              <li>The product received is different from what was ordered.</li>
            </ul>
            <p className="mt-3">
              The product must be unused, in its original condition, with all original packaging, labels, and proof of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. Return Approval</h2>
            <p>
              All return requests are subject to verification and approval by MyOwnFresh. Customers may be required to provide the order details along with clear photographs or videos of the product to support their request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Upon Successful Return</h2>
            <p className="mb-2">Once the returned product is received and successfully verified, customers may choose either:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>A refund to the original payment method</li>
              <p className="ml-6 text-gray-500 font-bold uppercase tracking-wider text-[10px] my-1">OR</p>
              <li>An exchange for the same or an equivalent product, subject to stock availability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Refund Timeline</h2>
            <p>
              Approved refunds will be processed and credited within 5–7 business days on the original payment method. The actual credit timeline may vary depending on your bank or payment service provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Exchange Timeline</h2>
            <p>
              Approved exchange products will be dispatched within 2–3 business days after the exchange request is approved and are generally delivered within 5–7 business days, depending on the delivery location and courier availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">7. Non-Returnable Items</h2>
            <p className="mb-2">Returns will not be accepted for:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Products that have been used or damaged after delivery.</li>
              <li>Products returned without their original packaging or labels.</li>
              <li>Requests raised after the 7-day return period.</li>
              <li>Products damaged due to improper handling or misuse by the customer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">8. Cancellation Policy</h2>
            <p>
              Orders may be cancelled only before dispatch.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-black mb-3">9. Contact Us</h2>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm space-y-1">
              <p className="font-bold text-black text-base">MyOwnFresh</p>
              <p className="font-semibold text-gray-700">OWNFRESH AGRO INDUSTRIES</p>
              <p>Ground Floor, Shed No. 1, Vir Maruti Complex, 30/13 Dhayari, Vadgaon Budruk, Pune, Maharashtra – 411041, India</p>
              <p className="pt-2"><b>Phone:</b> +91 9689889191</p>
              <p><b>Email:</b> <a href="mailto:my1ownfresh@gmail.com" className="text-yellow-600 hover:underline">my1ownfresh@gmail.com</a></p>
              <p><b>Website:</b> <a href="https://myownfresh.com/" className="text-yellow-600 hover:underline">https://myownfresh.com/</a></p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default RefundPolicy;
