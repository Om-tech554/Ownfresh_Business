import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SLink from './SLink';

/* --- OUR STORY (HOMEPAGE SNIPPET) --- */
export const OurStorySnippet = () => {
    const navigate = useNavigate();
    return (
        <section className="w-full bg-[#fcfcfc] py-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full lg:w-1/2 flex justify-center">
                    <div className="relative w-full aspect-[4/3] bg-gray-100 shadow-[15px_15px_0_#FFDD00] border border-gray-200">
                        <img className="w-full h-full object-cover" src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1775112913/ownfresh_media/lo3psirlwzaqc5bsyfbx.png" alt="Botanic Purity" />
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 border-l-4 border-[#FFDD00] pl-3">Discover</p>
                    <h2 className="text-3xl md:text-5xl font-black text-black uppercase mb-6 leading-tight">
                        Our <span className="bg-[#FFDD00] px-2 py-0 inline-block">Story</span>
                    </h2>
                    <h3 className="text-2xl md:text-3xl font-semibold text-black uppercase mb-6 leading-tight">Pure...Natural...Truly Fresh 😍</h3>
                    <p className="text-gray-700 leading-relaxed mb-6 font-medium text-lg">
                        Discover the essence of health and taste with our 100% pure, stone-pressed oils. Crafted from the finest soil-grown nuts and seeds, our oils are natural, nutrient-rich, and made to elevate every recipe.

                        At OwnFresh, we bring you the perfect blend of tradition, purity, and care straight from our heritage to your kitchen.
                    </p>
                    <SLink to="/whyownfresh" className="btn-secondary inline-flex items-center justify-center">Read More</SLink>
                </div>
            </div>
        </section>
    );
};

/* --- GALLERY --- */
export const Gallery = () => {
    const navigate = useNavigate();

    // ✏️ Replace these 3 URLs with your own product image URLs
    const featuredImage = "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=900&auto=format&fit=crop";
    const sideImage1 = "https://images.unsplash.com/photo-1598202493891-8f1c6fe5bc4e?q=80&w=700&auto=format&fit=crop";
    const sideImage2 = "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=700&auto=format&fit=crop";

    const highlights = [
        { label: "Our Manufacturing Process", desc: "From raw seeds to the final golden drop." },
        { label: "Our Products", desc: "A showcase of our premium stone-pressed oils." },
        { label: "Customer Moments", desc: "Real people, real stories, real flavors." },
        { label: "Events & Milestones", desc: "Celebrating our journey with our community." },
    ];

    return (
        <section className="w-full bg-[#FEF7DC] py-16 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">

                {/* Big Headline */}
                <h2 className="text-4xl md:text-6xl font-black text-black leading-tight mb-10 max-w-2xl">
                    A Journey of Purity &amp; Tradition
                </h2>

                {/* 3-column layout */}
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">

                    {/* LEFT — text + bullets + CTA */}
                    <div className="w-full lg:w-[28%] flex flex-col justify-center gap-6">
                        <p className="text-gray-700 text-base leading-relaxed">
                            Explore our journey, from selecting the finest soil nuts and seeds to
                            crafting <strong>100% pure, stone-pressed oils</strong>. Witness the
                            passion behind our process, the richness of our oils, and the people
                            who make it all possible.
                        </p>

                        <div>
                            <p className="font-bold text-black mb-3 text-sm">
                                What You'll Find in Our Gallery:
                            </p>
                            <ul className="flex flex-col gap-2">
                                {highlights.map((h, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="text-red-500 mt-0.5 shrink-0">🌸</span>
                                        <span>
                                            <strong>{h.label}</strong> – {h.desc}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => navigate("/gallery")}
                            className="group inline-flex items-center gap-3 self-start bg-black hover:bg-[#FFDD00] text-white hover:text-black font-black uppercase tracking-widest text-xs px-7 py-3.5 transition-all duration-300 shadow-md mt-2"
                        >
                            View Full Gallery
                            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </button>
                    </div>

                    {/* CENTER — large featured image */}
                    <div
                        onClick={() => navigate("/gallery")}
                        className="group w-full lg:w-[44%] overflow-hidden bg-gray-200 cursor-pointer shadow-md"
                        style={{ minHeight: "380px" }}
                    >
                        <img
                            src={featuredImage}
                            alt="Featured Gallery"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            style={{ minHeight: "380px" }}
                        />
                    </div>

                    {/* RIGHT — two stacked images */}
                    <div className="w-full lg:w-[28%] flex flex-col gap-4">
                        <div
                            onClick={() => navigate("/gallery")}
                            className="group flex-1 overflow-hidden bg-gray-200 cursor-pointer shadow-md"
                            style={{ minHeight: "182px" }}
                        >
                            <img
                                src={sideImage1}
                                alt="Gallery Image 2"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                style={{ minHeight: "182px" }}
                            />
                        </div>
                        <div
                            onClick={() => navigate("/gallery")}
                            className="group flex-1 overflow-hidden bg-gray-200 cursor-pointer shadow-md"
                            style={{ minHeight: "182px" }}
                        >
                            <img
                                src={sideImage2}
                                alt="Gallery Image 3"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                style={{ minHeight: "182px" }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

/* --- FAQ SECTION --- */
export const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(0);
    const faqs = [
        { q: "What makes OwnFresh oils different from regular cooking oils?", a: "OwnFresh oils are 100% pure, stone-pressed from whole nuts and seeds. We use traditional cold-pressing techniques to retain the natural nutrients, making our oils healthier and more flavorful. No chemicals or additives are used, ensuring the highest quality." },
        { q: "Are OwnFresh oils certified organic?", a: "Yes, all OwnFresh oils are certified organic. We source premium-quality nuts and seeds that are grown without harmful pesticides or chemicals, ensuring that you and your family enjoy healthy, chemical-free cooking." },
        { q: "How does OwnFresh ensure the freshness and purity of its oils?", a: "We carefully monitor every step, from sourcing raw materials to the cold-pressing process. Each batch of oil is produced in small quantities to maintain freshness, and our packaging is designed to preserve the oil’s natural flavor and nutrients." },
        { q: "Can this oil be used for deep frying?", a: "Absolutely. Our oils have a high smoke point and maintain molecular integrity perfectly during frying." }
    ];

    return (
        <section className="w-full bg-[#fcfcfc] py-20 px-6 md:px-12 lg:px-24 border-t border-gray-100">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase">Got <span className="text-[#FFDD00]">Questions?</span></h2>
                    <p className="uppercase text-gray-500 font-bold tracking-widest text-xs mt-4">Frequently Asked Questions</p>
                </div>
                <div className="flex flex-col gap-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(i === openIndex ? -1 : i)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-bold text-black uppercase">{faq.q}</span>
                                <span className={`transform transition-transform duration-300 font-black text-xl text-[#FFDD00] ${i === openIndex ? 'rotate-180' : ''}`}>↓</span>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${i === openIndex ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
                                <p className="p-6 text-gray-600 font-medium">{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
