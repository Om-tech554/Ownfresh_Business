import React from "react";
import SLink from "../components/SLink";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Eye,
  Target,
  Award,
  CheckCircle2,
  Heart,
  Leaf,
  ArrowUpRight
} from "lucide-react";
import Navbar from "../components/Navbar";

// Framer motion variants for clean scroll animations
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const imageReveal = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" }
  }
};

const WhyOwnFresh = () => {
  return (
    <div className="min-h-screen bg-[#FCFBF7] text-gray-800 font-sans selection:bg-[#FFDD00] selection:text-black">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial from-[#FFDD00]/10 to-transparent rounded-full -z-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-radial from-[#24672E]/5 to-transparent rounded-full -z-10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Left Column: Headline and Badges */}
            <motion.div
              className="lg:col-span-7 space-y-6 text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFDD00]/25 border border-[#FFDD00]/40 text-black font-bold text-xs tracking-wider uppercase">
                <Sparkles size={14} className="text-black animate-pulse" />
                Welcome to OwnFresh
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-black leading-[1.1] tracking-tight uppercase">
                The Essence of Pure, <br />
                <span className="relative inline-block">
                  <span className="relative z-10">Artisan Oils</span>
                  <span className="absolute left-0 bottom-1.5 w-full h-3 bg-[#FFDD00] -z-10 transform -rotate-1 rounded-sm" />
                </span> <br />
                from OwnFresh
              </h1>

              <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-2xl">
                Honoring nature's wisdom to extract botanically pure, stone-pressed oils. Crafted with precision, transparency, and integrity to enrich your wellness and culinary joy.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <SLink
                  to="/shop"
                  className="px-8 py-4 rounded-xl bg-black text-[#FFDD00] hover:bg-gray-900 transition-all duration-300 font-bold text-sm tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-black/10 hover:shadow-black/20 transform hover:-translate-y-0.5"
                >
                  Explore Shop <ArrowRight size={16} />
                </SLink>
                <a
                  href="#story"
                  className="px-8 py-4 rounded-xl bg-white text-black border border-gray-200 hover:border-black transition-all duration-300 font-bold text-sm tracking-wider uppercase flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5"
                >
                  Our Story
                </a>
              </div>
            </motion.div>

            {/* Right Column: Hero Image Frame */}
            <motion.div
              className="lg:col-span-5 flex justify-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={imageReveal}
            >
              <div className="relative w-full max-w-[420px] aspect-[4/3] md:aspect-square lg:aspect-[4/5]">
                {/* Decorative gold backdrop rectangle */}
                <div className="absolute inset-0 bg-[#FFDD00] rounded-[2rem] transform rotate-3 scale-95 shadow-xl -z-10 transition-transform duration-500 hover:rotate-1" />

                {/* Image Wrapper */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl p-4 flex items-center justify-center transform transition-transform duration-500 hover:scale-[1.02]">
                  <img
                    className="w-full h-full object-cover rounded-[1.5rem]"
                    src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011497/static_site/OUR-HERITAGE-1024x658.png"
                    alt="Our Heritage & Artisan Cooking Oils"
                    loading="eager"
                  />
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-6 -left-6 bg-black text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-[#FFDD00] flex items-center justify-center text-black font-black text-xs">100%</div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Purity Grade</p>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Botanic Pure</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* PROMOTING BOTANICAL PURITY SECTION */}
      <section className="bg-black py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#24672E_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col items-center space-y-4"
          >
            <Leaf className="text-[#FFDD00]" size={36} />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide uppercase">
              Promoting botanical purity for a healthier life
            </h2>
            <div className="w-20 h-1 bg-[#FFDD00] rounded-full mt-2" />
          </motion.div>
        </div>
      </section>

      {/* STORY SECTION (FROM SOIL TO SOUL) */}
      <section id="story" className="py-20 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Left Column: Image with unique offset styling */}
            <motion.div
              className="lg:col-span-5 flex justify-center order-2 lg:order-1"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={imageReveal}
            >
              <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl group border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <img
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                  src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011499/static_site/ligin.png"
                  alt="OwnFresh Pure Seed Stone Pressing"
                  loading="lazy"
                />

                {/* Absolute overlay tag */}
                <div className="absolute bottom-6 left-6 right-6 z-20 text-white text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFDD00] bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">Est. 2019</span>
                  <p className="text-lg font-bold mt-2">Nurtured by Soil, Extracted for Soul</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Story timeline and text */}
            <motion.div
              className="lg:col-span-7 text-left space-y-8 order-1 lg:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight uppercase">
                  From Soil to Soul: <br />
                  <span className="text-[#24672E] font-serif italic font-normal">Crafting Purity</span>, One Drop at a Time
                </h2>
                <div className="w-20 h-1 bg-[#FFDD00] rounded-full" />
              </div>

              {/* Timeline blocks */}
              <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">

                {/* Milestone 1 */}
                <div className="flex gap-6 relative group">
                  <div className="w-8 h-8 rounded-full bg-[#FFDD00]/20 border border-[#FFDD00] text-black font-black text-xs flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-[#FFDD00] transition-colors duration-300">
                    01
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-black flex items-center gap-2 uppercase tracking-wide">
                      2019 — Research & Trials
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                      Our journey began in 2019 with extensive research, learning, analysis, practical trials, and developing innovative extraction methods. These efforts led us to craft prototypes for producing Botanic Purity grade edible oils from soil-grown nuts and seeds.
                    </p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="flex gap-6 relative group">
                  <div className="w-8 h-8 rounded-full bg-[#FFDD00]/20 border border-[#FFDD00] text-black font-black text-xs flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-[#FFDD00] transition-colors duration-300">
                    02
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-black uppercase tracking-wide">
                      2021 — The Dream Becomes Reality
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                      In 2021, our dream became a reality with the launch of our startup at Laxmi Industrial Estate, located in the rural heart of Pune, Maharashtra, India. This marked the opening of ‘OwnFresh’—our first manufacturing facility dedicated to extracting 100% pure, stone-pressed, natural oils that retain vital micronutrients.
                    </p>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="flex gap-6 relative group">
                  <div className="w-8 h-8 rounded-full bg-[#FFDD00]/20 border border-[#FFDD00] text-black font-black text-xs flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-[#FFDD00] transition-colors duration-300">
                    03
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-black uppercase tracking-wide">
                      The Name "OwnFresh"
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                      The name ‘OwnFresh’ was inspired by the essence of soil-grown nuts and seeds, the creative recipes of chefs, and the passion of food enthusiasts.
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-4">
                <SLink
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-black hover:bg-black hover:text-white transition-all duration-300 font-bold text-sm tracking-wider uppercase"
                >
                  Meet Us <ArrowUpRight size={16} />
                </SLink>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* BELIEF / PHILOSOPHY COVER SECTION */}
      <section className="relative py-28 md:py-40 bg-gray-900 overflow-hidden">
        {/* Parallax-like Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            className="w-full h-full object-cover object-center"
            src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011501/static_site/DSC08274-scaled.jpg"
            alt="Artisan food and premium cooking oils background"
            loading="lazy"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="flex justify-center">
            <motion.div
              className="max-w-3xl text-center bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-14 rounded-3xl shadow-2xl text-white space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Heart className="text-[#FFDD00] mx-auto animate-pulse" size={40} />

              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                We believe food is far more than just dining out.
              </h2>

              <p className="text-base md:text-lg text-gray-200 font-medium leading-relaxed">
                Our mission is to satisfy and delight everyone—from kitchen queens to professional caterers and chefs—by providing oils that elevate every recipe. We proudly stand for 100% pure, stone-pressed, Botanic Purity grade oils and actively support women empowerment.
              </p>

              <div className="pt-4">
                <SLink
                  to="/shop"
                  className="inline-block px-10 py-4 rounded-xl bg-[#FFDD00] text-black font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#FFDD00]/20 hover:shadow-[#FFDD00]/40 transform hover:-translate-y-0.5 transition-all duration-300 animate-bounce"
                >
                  Shop Now
                </SLink>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION SECTION */}
      <section className="py-20 md:py-28 bg-[#FCFBF7]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Left Side: Text Cards Container */}
            <div className="lg:col-span-7 flex flex-col gap-10 text-left order-2 lg:order-1">

              {/* Vision Card */}
              <motion.div
                className="bg-black text-white p-8 md:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFDD00]/10 rounded-bl-full -z-0" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFDD00] text-black flex items-center justify-center">
                    <Eye size={24} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-wider">Our Vision</h3>
                </div>

                <ul className="space-y-3.5 relative z-10">
                  {[
                    "Be Real",
                    "Be Accountable",
                    "What we do, we do it WELL",
                    "Satisfy and delight our customers with every food platter"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 font-semibold text-gray-300 text-sm md:text-base">
                      <CheckCircle2 size={20} className="text-[#FFDD00] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Mission Card */}
              <motion.div
                className="bg-white text-gray-800 p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 space-y-6 relative hover:shadow-xl transition-all duration-300"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#24672E]/10 text-[#24672E] flex items-center justify-center">
                    <Target size={24} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-wider text-black">Our Mission</h3>
                </div>

                <div className="space-y-4 text-gray-600 font-medium leading-relaxed text-sm md:text-base">
                  <p>
                    From soil-grown nuts to Botanic Purity grade cooking oils, everything we do revolves around you and your culinary passion.
                  </p>
                  <p>
                    Whether it’s the home cook crafting flavorful recipes or professional chefs creating exquisite dishes, we take pride in producing oils that are natural, real, and 100% pure—extracted from the first stone pressing of whole nuts and seeds.
                  </p>
                  <p>
                    We remain dedicated to your taste, health, and well-being. After all, food is culture, creativity, and a shared craving for excellence.
                  </p>
                </div>
              </motion.div>

            </div>

            {/* Right Side: Showcase Image */}
            <motion.div
              className="lg:col-span-5 flex justify-center order-1 lg:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={imageReveal}
            >
              <div className="relative w-full max-w-[420px] aspect-[4/3] md:aspect-square lg:aspect-[4/5]">
                <div className="absolute inset-0 bg-[#24672E] rounded-[2rem] transform -rotate-3 scale-95 shadow-xl -z-10" />
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl p-4 flex items-center justify-center">
                  <img
                    className="w-full h-full object-cover rounded-[1.5rem]"
                    src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011504/static_site/DSC08279-1024x683.jpg"
                    alt="OwnFresh Cooking Oil Mission"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ACOHI CERTIFICATION SECTION */}
      <section className="py-20 md:py-28 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Left Column: Certification Text */}
            <motion.div
              className="lg:col-span-5 space-y-6 text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#24672E]/10 border border-[#24672E]/20 text-[#24672E] font-semibold text-xs uppercase tracking-wider">
                <Award size={14} />
                Pune's Culinary Award
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight uppercase">
                ACoHI Culinary ID Certificate
              </h2>

              <p className="text-base md:text-lg text-gray-600 font-medium leading-relaxed">
                Ownfresh Agro Industries is proud to be awarded the <strong className="text-black font-bold">ACoHI Prestigious Culinary ID Certificate</strong>, recognizing our high-quality and process-compliant oil manufacturing methods for the culinary industry in Pune. 🌿🥇
              </p>

              <div className="pt-2">
                <SLink
                  to="/gallery?category=Certifications"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white hover:bg-gray-900 transition-colors font-bold text-sm tracking-wider uppercase"
                >
                  View Our Certificates
                </SLink>
              </div>
            </motion.div>

            {/* Right Column: Certificate Images in Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">

              {/* Certificate 1 */}
              <motion.div
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 group flex flex-col"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="overflow-hidden rounded-2xl flex-1 bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011506/static_site/WhatsApp-Image-2024-12-21-at-19.48.42_6ecba840-719x1024.jpg"
                    alt="ACoHI Culinary ID Certificate Page 1"
                    className="w-full max-h-[380px] object-contain rounded-xl transform scale-100 group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 text-center">
                  <span className="text-xs font-bold text-[#24672E] uppercase tracking-wider">Culinary Process ID</span>
                </div>
              </motion.div>

              {/* Certificate 2 */}
              <motion.div
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 group flex flex-col"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="overflow-hidden rounded-2xl flex-1 bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786011508/static_site/WhatsApp-Image-2024-12-21-at-19.55.12_17bcfa25-rotated.jpg"
                    alt="ACoHI Culinary ID Certificate Page 2"
                    className="w-full max-h-[380px] object-contain rounded-xl transform scale-100 group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 text-center">
                  <span className="text-xs font-bold text-[#24672E] uppercase tracking-wider">Accredited Compliance</span>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-white relative overflow-hidden">

        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="w-full flex justify-center"
          >
            <div className="relative w-full max-w-4xl mx-auto rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1782912358/ownfresh_media/lspdtx4ppnjg7ysekhv0.png"
                alt="Switch to a Healthier Lifestyle with OwnFresh"
                className="w-full h-auto object-contain rounded-[1.5rem] md:rounded-[2rem]"
              />
              <SLink
                to="/shop"
                className="absolute top-[71.4%] left-1/2 -translate-x-1/2 px-4 py-1 sm:px-5 sm:py-1.5 md:px-6 md:py-2 rounded-full bg-black text-white hover:bg-white hover:text-black transition-all duration-300 font-bold text-[8px] sm:text-[9px] md:text-[11px] tracking-wide shadow-xl hover:scale-[1.03] flex items-center justify-center min-w-[70px] sm:min-w-[90px] md:min-w-[110px]"
              >
                Shop Now
              </SLink>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WhyOwnFresh;
