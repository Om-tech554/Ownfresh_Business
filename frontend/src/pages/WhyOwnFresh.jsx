import React from "react";
import Navbar from "../components/Navbar";

const WhyOwnFresh = () => {
  return (
    <>
      <Navbar />
      <section className="w-full bg-white py-12 px-6 md:px-12 lg:px-24">
        {/* HEADER */}
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter">
            Our <span className="text-[#F9DD19]">Story</span>
          </h1>
          <div className="w-24 h-1.5 bg-[#F9DD19] mx-auto mt-6 mb-8"></div>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-widest mb-4">
            From Soil to Soul: Crafting Purity, One Drop at a Time
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed">
            We believe food is far more than just dining out. It is culture, creativity, and a shared craving for excellence. Our Botanic Purity grade cooking oils represent this philosophy—pure, without chemicals, preservatives, or additives.
          </p>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col gap-24">
          
          {/* ZIG ZAG 1: IMAGE LEFT / TEXT RIGHT */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-[90%] md:w-[80%] aspect-[4/5] bg-gray-100 shadow-[20px_20px_0_#F9DD19] border border-gray-200">
                 <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1596728073577-fb5ac8680008?q=80&w=1000&auto=format&fit=crop"
                    alt="Botanic Purity"
                  />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start text-left">
              <h2 className="text-3xl md:text-4xl font-black text-black uppercase mb-6">
                Botanic <span className="bg-[#F9DD19] px-2 py-1">Purity</span>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6 font-medium">
                OwnFresh Cooking Oil Series is a premium, researched produce of the OwnFresh Group. 
                Premium quality with Botanic Purity, Global Gold Standards, Industry Certified, and NABL accredited lab tested.
              </p>
              <p className="text-gray-700 leading-relaxed font-medium">
                Each OwnFresh Oil is delicious, light and carries a natural nutty taste. It helps your body absorb nutrients from the food you eat, improves digestion, reduces inflammation, and supports heart health.
              </p>
            </div>
          </div>

          {/* ZIG ZAG 2: TEXT LEFT / IMAGE RIGHT */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-[90%] md:w-[80%] aspect-[4/5] bg-gray-100 shadow-[-20px_20px_0_#F9DD19] border border-gray-200">
                <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=1000&auto=format&fit=crop"
                    alt="Extraction Process"
                  />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start text-left">
              <h2 className="text-3xl md:text-4xl font-black text-black uppercase mb-6">
                Ancient <span className="bg-black text-white px-2 py-1">Extraction</span>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6 font-medium">
                OwnFresh Oils are extracted in small batches using single pressing. Nuts, seeds, kernels, and drupes are carefully handpicked and processed at room temperature by the ancient stone-age Kolhu (Kacchi Ghani) method.
              </p>
              <p className="text-gray-700 leading-relaxed font-medium">
                Each oil is naturally sedimented for 100 hours — a purification process that retains nutrients, plant-based sterols and preserves the original nutty aroma.
              </p>
            </div>
          </div>

          {/* ZIG ZAG 3: IMAGE LEFT / TEXT RIGHT (BENEFITS) */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-[90%] md:w-[80%] aspect-square bg-gray-100 shadow-[20px_20px_0_black] border border-gray-200 p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-black text-black uppercase mb-4">“Oil Hai… Oily Nahi”</h3>
                <ul className="space-y-3 list-none text-gray-800 font-bold text-sm">
                  <li className="flex items-start gap-2"><span className="text-[#F9DD19] text-lg">■</span> Minimal oil retention during deep frying</li>
                  <li className="flex items-start gap-2"><span className="text-[#F9DD19] text-lg">■</span> Non-genetically modified soil nuts</li>
                  <li className="flex items-start gap-2"><span className="text-[#F9DD19] text-lg">■</span> Unfiltered & Unrefined – No chemicals</li>
                  <li className="flex items-start gap-2"><span className="text-[#F9DD19] text-lg">■</span> High Smoke Point – Maintains molecular integrity</li>
                  <li className="flex items-start gap-2"><span className="text-[#F9DD19] text-lg">■</span> Free from Argemone Oil & Trans Fat</li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start text-left">
              <h2 className="text-3xl md:text-4xl font-black text-black uppercase mb-6">
                Culinary <span className="text-[#F9DD19]">Benefits</span>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6 font-medium">
                “Good Food Language” – more food flavour, less oil taste, reduced usage. Stone Pressing ensures first pressing under controlled temperatures to retain micro nutrients, antioxidants and minerals.
              </p>
            </div>
          </div>

          {/* MISSION & VISION SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mt-12 border-t border-gray-200 pt-20">
             <div className="bg-gray-50 border border-gray-200 p-10 shadow-[10px_10px_0_#F9DD19] hover:-translate-y-2 transition-transform duration-300">
                <h2 className="text-3xl font-black text-black uppercase mb-6 flex items-center gap-4">
                  <span className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-lg">🎯</span> 
                  Our Mission
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  From soil-grown nuts to Botanic Purity grade cooking oils, everything we do revolves around you and your culinary passion. Whether it’s the home cook crafting flavorful recipes or professional chefs creating exquisite dishes, we take pride in producing oils that are natural, real, and 100% pure—extracted from the first stone pressing of whole nuts and seeds. We remain dedicated to your taste, health, and well-being.
                </p>
             </div>

             <div className="bg-black text-white p-10 shadow-[10px_10px_0_#F9DD19] hover:-translate-y-2 transition-transform duration-300 border border-black">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4 text-white">
                  <span className="bg-[#F9DD19] text-black w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-lg">👁️</span> 
                  Our Vision
                </h2>
                <p className="text-gray-300 leading-relaxed font-medium">
                  We envision a world where every Indian kitchen experiences the true, unadulterated essence of nature through our botanic purity. We believe food is culture, and we strive to preserve the ancient wisdom of Kacchi Ghani extraction to bring the golden elixir of health back to your dietary lifestyle.
                </p>
             </div>
          </div>

        </div>

        {/* ================= CERTIFICATES SECTION ================= */}
        <div className="max-w-7xl mx-auto mt-32 border-t border-gray-200 pt-16">
          <h3 className="text-2xl font-black text-black text-center mb-12 uppercase tracking-widest">
            Certifications & Quality Standards
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/certificates/fssai.png" alt="FSSAI" className="mx-auto h-16 object-contain" />
            <img src="/certificates/nabl.png" alt="NABL" className="mx-auto h-16 object-contain" />
            <img src="/certificates/iso.png" alt="ISO" className="mx-auto h-16 object-contain" />
            <img src="/certificates/non-gmo.png" alt="Non GMO" className="mx-auto h-16 object-contain" />
            <img src="/certificates/gmp.png" alt="GMP" className="mx-auto h-16 object-contain" />
          </div>
        </div>

      </section>
    </>
  );
};

export default WhyOwnFresh;
