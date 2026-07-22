import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
        <h1 className="text-3xl md:text-4xl font-black text-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: July 22, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <p className="text-gray-600 font-medium">
            This Privacy Policy explains how OWNFRESH AGRO INDUSTRIES, operating under the trade name MyOwnFresh ("we", "our", or "us"), collects, uses, stores, and protects your personal information when you visit or make a purchase through{" "}
            <a href="https://myownfresh.com/" className="text-yellow-600 hover:underline">
              https://myownfresh.com/
            </a>.
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
              <p><b>Email:</b> <a href="mailto:my1ownfresh@gmail.com" className="text-yellow-600 hover:underline">my1ownfresh@gmail.com</a></p>
              <p><b>Website:</b> <a href="https://myownfresh.com/" className="text-yellow-600 hover:underline">https://myownfresh.com/</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Information We Collect</h2>
            <p className="mb-2">We may collect the following information:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Mobile number</li>
              <li>Billing and shipping address</li>
              <li>Order and transaction details</li>
              <li>Customer support communications</li>
              <li>IP address, browser type, device information, and cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">Your personal information may be used to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Process and fulfill your orders</li>
              <li>Deliver products and provide customer support</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Improve our Website, products, and services</li>
              <li>Prevent fraud and unauthorized transactions</li>
              <li>Comply with applicable legal and regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Payment Information</h2>
            <p>
              Payments are processed securely through authorized third-party payment gateways. We do not store your complete debit/credit card details, CVV, UPI PIN, or internet banking credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Sharing of Information</h2>
            <p className="mb-2">We do not sell, rent, or trade your personal information. Information may be shared only with:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Payment gateway providers</li>
              <li>Courier and logistics partners</li>
              <li>Technology and hosting service providers</li>
              <li>Government or regulatory authorities where required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Cookies</h2>
            <p>
              Our Website may use cookies and similar technologies to enhance user experience, remember preferences, and analyze website traffic. You may disable cookies through your browser settings; however, some Website features may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">7. Data Security</h2>
            <p>
              We implement appropriate technical, administrative, and organizational safeguards to protect your personal information from unauthorized access, misuse, disclosure, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">8. Data Retention</h2>
            <p>
              We retain personal information only for as long as necessary to fulfill business, legal, regulatory, and accounting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">9. Your Rights</h2>
            <p>
              Subject to applicable law, you may request access to, correction of, or deletion of your personal information by contacting us at{" "}
              <a href="mailto:my1ownfresh@gmail.com" className="text-yellow-600 hover:underline">
                my1ownfresh@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any revisions will become effective immediately upon publication on the Website.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-black mb-3">11. Contact Us</h2>
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

export default PrivacyPolicy;
