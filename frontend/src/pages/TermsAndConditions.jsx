import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F14] py-16 px-6 md:px-20 text-gray-700 dark:text-[#B7C1CE] relative transition-colors duration-200">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 dark:text-[#818C9B] hover:text-black dark:hover:text-[#F5F7FA] transition-colors cursor-pointer bg-white dark:bg-[#171D26] px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-[#27313D] hover:shadow"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-semibold">Back</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white dark:bg-[#171D26] p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-[#27313D] mt-6"
      >
        <div className="flex justify-center mb-8 pb-6 border-b border-gray-100 dark:border-[#202832]">
          <a href="/">
            <img
              src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
              alt="OwnFresh Logo"
              className="h-10 md:h-12 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-black dark:text-[#F7F9FC] mb-2 text-center">Terms & Conditions</h1>
        <p className="text-sm text-gray-400 dark:text-[#818C9B] mb-8 text-center">Last Updated: July 22, 2026</p>

        <div className="space-y-6 leading-relaxed">
          <p className="text-gray-600 dark:text-[#B7C1CE] font-medium">
            These Terms & Conditions ("Terms") govern your access to and use of{" "}
            <a href="https://myownfresh.com/" className="text-yellow-600 dark:text-[#FFD600] hover:underline">
              https://myownfresh.com/
            </a>{" "}
            ("Website") and all products and services offered by OWNFRESH AGRO INDUSTRIES ("MyOwnFresh", "we", "our", or "us"). By accessing or using this Website, you agree to comply with these Terms.
          </p>

          <section className="pt-4">
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">1. Business Information</h2>
            <div className="bg-gray-50 dark:bg-[#151B23] p-5 rounded-2xl border border-gray-100 dark:border-[#27313D] text-sm space-y-2">
              <p><b className="dark:text-[#F5F7FA]">Trade Name:</b> MyOwnFresh</p>
              <p><b className="dark:text-[#F5F7FA]">Legal Business Name:</b> OWNFRESH AGRO INDUSTRIES</p>
              <p>
                <b className="dark:text-[#F5F7FA]">Registered Address:</b> Ground Floor, Shed No. 1, Vir Maruti Complex, 30/13 Dhayari, Vadgaon Budruk, Pune, Maharashtra – 411041, India
              </p>
              <p><b className="dark:text-[#F5F7FA]">Phone:</b> +91 9689889191</p>
              <p><b className="dark:text-[#F5F7FA]">Email:</b> <a href="mailto:contact@myownfresh.com" className="text-yellow-600 dark:text-[#FFD600] hover:underline">contact@myownfresh.com</a></p>
              <p><b className="dark:text-[#F5F7FA]">Website:</b> <a href="https://myownfresh.com/" className="text-yellow-600 dark:text-[#FFD600] hover:underline">https://myownfresh.com/</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age or access the Website under the supervision of a parent or legal guardian.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">3. Products</h2>
            <p>
              MyOwnFresh offers fresh agricultural and food products through this Website. Product images are for illustration purposes only. Actual products may vary slightly due to seasonal availability and natural variations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">4. Orders</h2>
            <p>
              Placing an order constitutes an offer to purchase. Orders are accepted only after payment verification and confirmation of availability. We reserve the right to refuse or cancel any order due to stock limitations, pricing errors, payment issues, or suspected fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">5. Pricing & Payments</h2>
            <p>
              All prices are displayed in Indian Rupees (INR) and include applicable taxes unless otherwise stated. Payments are processed securely through authorized third-party payment gateways.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">6. Shipping & Delivery</h2>
            <p>
              Orders will be shipped in accordance with our Shipping Policy. Estimated delivery timelines are indicative and may vary depending on location and courier operations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">7. Returns, Refunds & Cancellations</h2>
            <p>
              Returns, refunds, replacements, and cancellations shall be governed by our Return & Refund Policy published on the Website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">8. Intellectual Property</h2>
            <p>
              All content on this Website, including logos, trademarks, product images, text, graphics, and designs, is the exclusive property of MyOwnFresh and may not be copied, reproduced, or used without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MyOwnFresh shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid for the relevant order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">10. Governing Law</h2>
            <p>
              These Terms & Conditions shall be governed by the laws of India. Any disputes arising out of these Terms shall be subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">11. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms & Conditions at any time. Updated versions will be published on this Website and become effective immediately upon posting.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100 dark:border-[#202832]">
            <h2 className="text-xl font-bold text-black dark:text-[#F7F9FC] mb-3">12. Contact Us</h2>
            <div className="bg-gray-50 dark:bg-[#151B23] p-5 rounded-2xl border border-gray-100 dark:border-[#27313D] text-sm space-y-1">
              <p className="font-bold text-black dark:text-[#F7F9FC] text-base">MyOwnFresh</p>
              <p className="font-semibold text-gray-700 dark:text-[#B7C1CE]">OWNFRESH AGRO INDUSTRIES</p>
              <p>Ground Floor, Shed No. 1, Vir Maruti Complex, 30/13 Dhayari, Vadgaon Budruk, Pune, Maharashtra – 411041, India</p>
              <p className="pt-2"><b className="dark:text-[#F5F7FA]">Phone:</b> +91 9689889191</p>
              <p><b className="dark:text-[#F5F7FA]">Email:</b> <a href="mailto:contact@myownfresh.com" className="text-yellow-600 dark:text-[#FFD600] hover:underline">contact@myownfresh.com</a></p>
              <p><b className="dark:text-[#F5F7FA]">Website:</b> <a href="https://myownfresh.com/" className="text-yellow-600 dark:text-[#FFD600] hover:underline">https://myownfresh.com/</a></p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;
