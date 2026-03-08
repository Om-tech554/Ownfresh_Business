import Navbar from "../components/Navbar"; 
import React from "react";

const WhyOwnFresh = () => {
  return (
    <>
          <Navbar />
    <section className="w-full bg-white py-16 px-6 md:px-20 mt-[70px]">
      
      {/* ================= VIDEO SECTION ================= */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
          <video
            className="w-full h-full object-cover"
            src="/videos/ownfresh-oil.mp4"  // 🔁 Replace with your video path
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>

      {/* ================= TEXT CONTENT ================= */}
      <div className="max-w-5xl mx-auto space-y-10 text-gray-800">

        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-yellow-500">
            “Rishta Dil Se”
          </h2>
          <p className="text-lg text-gray-600">
            A Plethora of Botanic Goodness – Cooking Oil Series
          </p>
        </div>

        <div className="space-y-6 leading-relaxed text-justify">
          <p>
            OwnFresh Cooking Oil Series is a premium, researched produce of the
            OwnFresh (India) Group. Extremely pure, without chemicals,
            preservatives or additives. Premium quality with Botanic Purity,
            Global Gold Standards, Industry Certified, and NABL accredited lab tested.
          </p>

          <p>
            Each OwnFresh Oil is delicious, light and carries a natural nutty taste.
            It helps your body absorb nutrients from the food you eat, improves digestion,
            reduces inflammation, and supports heart health.
          </p>

          <p>
            The entire product range falls within a realistic price bracket and
            delivers true value for money.
          </p>
        </div>

        {/* ================= EXTRACTION PROCESS ================= */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold border-b pb-2">
            Extraction Process – ‘Safe Food’ Directives
          </h3>

          <p>
            OwnFresh Oils are extracted in small batches using single pressing.
            Nuts, seeds, kernels and drupes are carefully handpicked and processed
            at room temperature by the ancient stone-age Kolhu (Kacchi Ghani) method,
            under hygienic conditions following strict Good Manufacturing Practices.
          </p>

          <p>
            Each oil is naturally sedimented for 100 hours — a purification process
            that retains nutrients, plant-based sterols and preserves the original
            nutty aroma.
          </p>

          <p>
            Relish the natural flavour and authentic nutty aroma of OwnFresh Oils.
          </p>
        </div>

        {/* ================= BENEFITS ================= */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold border-b pb-2">
            Benefits – “Oil Hai… Oily Nahi”
          </h3>

          <ul className="space-y-4 list-disc pl-6 text-gray-700">
            <li>
              Minimal oil retention during deep frying – tissue not required.
            </li>
            <li>
              “Good Food Language” – more food flavour, less oil taste, reduced usage.
            </li>
            <li>
              Stone Pressing – first pressing under controlled temperature to retain
              micro nutrients.
            </li>
            <li>
              Non-GMO – Soil nuts and seeds are non-genetically modified.
            </li>
            <li>
              Rich in antioxidants and minerals with subtle cooking-special taste.
            </li>
            <li>
              Unique separation of saturated fats during extraction.
            </li>
            <li>
              Unrefined & Unfiltered – No preservatives, chemicals, artificial colours or additives.
            </li>
            <li>
              High Smoke Point – Suitable for deep frying and maintains molecular integrity.
            </li>
            <li>
              Free from Argemone Oil • No Trans Fat • No Cholesterol
            </li>
          </ul>
        </div>
      </div>

      {/* ================= CERTIFICATES SECTION ================= */}
      <div className="max-w-6xl mx-auto mt-20">
        <h3 className="text-3xl font-semibold text-center mb-10">
          Certifications & Quality Standards
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
          
          <img
            src="/certificates/fssai.png"
            alt="FSSAI"
            className="mx-auto h-20 object-contain"
          />

          <img
            src="/certificates/nabl.png"
            alt="NABL"
            className="mx-auto h-20 object-contain"
          />

          <img
            src="/certificates/iso.png"
            alt="ISO"
            className="mx-auto h-20 object-contain"
          />

          <img
            src="/certificates/non-gmo.png"
            alt="Non GMO"
            className="mx-auto h-20 object-contain"
          />

          <img
            src="/certificates/gmp.png"
            alt="GMP"
            className="mx-auto h-20 object-contain"
          />

        </div>
      </div>

    </section>
    </>
  );
};

export default WhyOwnFresh;
