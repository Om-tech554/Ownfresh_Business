import React from 'react';
import { motion } from 'framer-motion';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20 text-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100"
      >
        <h1 className="text-4xl font-black text-black mb-2">Terms and Conditions</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: July 15, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using the OwnFresh website, you agree to be bound by these Terms and Conditions. 
              If you do not agree to all of these terms, please do not use our website or purchase our products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Product Information and Pricing</h2>
            <p>
              We make every effort to display the details, descriptions, and pricing of our stone-pressed oils and organic botanical 
              products as accurately as possible. However, we do not warrant that product descriptions or other content are error-free. 
              Prices are subject to change without prior notice, and we reserve the right to modify or discontinue products at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. Orders and Account Security</h2>
            <p>
              When creating an account, you are responsible for maintaining the confidentiality of your login details. 
              We reserve the right to refuse or cancel any order for reasons including but not limited to: product availability, 
              errors in product description or pricing, or suspected unauthorized or fraudulent transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Intellectual Property</h2>
            <p>
              All content on this website—including logos, product designs, images, text, and source code—is the intellectual property of 
              OwnFresh and is protected by applicable trademark, copyright, and patent laws. You may not reproduce, distribute, or copy 
              any material from this site without our explicit written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Limitation of Liability</h2>
            <p>
              OwnFresh and its team shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the 
              use or inability to use our products or website. Our maximum liability to you for any product purchased through this website 
              shall be strictly limited to the purchase price of that product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Governing Law</h2>
            <p>
              These Terms and Conditions and any separate agreements whereby we provide you services shall be governed by and construed in 
              accordance with the laws of India, under the jurisdiction of the courts of Pune, Maharashtra.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-black mb-3">7. Contact Information</h2>
            <p>If you have any questions or require clarification regarding our Terms and Conditions, please contact us at:</p>
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

export default TermsAndConditions;
