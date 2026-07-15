import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20 text-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100"
      >
        <h1 className="text-4xl font-black text-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: July 15, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Introduction</h2>
            <p>
              Welcome to OwnFresh. We value your trust and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website 
              (including <span className="font-semibold text-yellow-600">frontend-ownfresh.onrender.com</span> and our custom domains) 
              and purchase our stone-pressed oils and organic botanical products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect information that you voluntarily provide to us when placing an order or registering an account, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong className="text-black">Personal Identifiers:</strong> Name, shipping address, billing address, email address, and phone/WhatsApp number.</li>
              <li><strong className="text-black">Account Credentials:</strong> Login credentials managed securely via Firebase Authentication.</li>
              <li><strong className="text-black">Payment Details:</strong> Transaction IDs and details necessary to verify payments. All payment details are processed securely by our authorized payment gateways (PhonePe) and are not stored on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use your information for business-related purposes, such as:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Processing, packaging, shipping, and delivering your orders.</li>
              <li>Sending email/SMS order confirmations, invoices, and shipping tracking updates.</li>
              <li>Providing customer support and responding to inquiries.</li>
              <li>Improving our website performance, catalog, and overall customer experience.</li>
              <li>Sending promotional newsletters (only if you opt-in/subscribe).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Cookies and Location Data</h2>
            <p>
              We use cookies and similar tracking technologies to enhance user session persistence, shopping cart functionality, and analytics. 
              Additionally, we use secure geolocation APIs (such as Geoapify) to assist you in auto-filling delivery addresses during checkout. 
              No private location logs are retained on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Data Protection and Third Parties</h2>
            <p>
              We employ strict security measures, including HTTPS encryption, Firebase App Check, and role-based authentication to protect your data. 
              We do not sell, rent, or share your personal data with third parties for marketing purposes. Your data is shared only with trusted service partners 
              assisting in deliveries (logistics partners), cloud database security, and payment processing (PhonePe).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Your Rights</h2>
            <p>
              You have the right to access, edit, or request deletion of the personal information stored in your account profile at any time. 
              For any privacy-related requests or concerns, please contact our support desk.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-black mb-3">7. Contact Us</h2>
            <p>For questions or comments about this Privacy Policy, please reach out to us at:</p>
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

export default PrivacyPolicy;
