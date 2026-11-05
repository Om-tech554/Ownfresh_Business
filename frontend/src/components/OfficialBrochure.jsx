import React from 'react';
import { Download, ExternalLink, FileText, CheckCircle2, ShieldCheck, Sparkles, Award } from 'lucide-react';

const OfficialBrochure = () => {
    const brochurePdfUrl = '/OwnFresh-Official-Brochure.pdf';

    return (
        <section className="w-full bg-[#FAFAFA] dark:bg-[#111720] py-14 sm:py-18 md:py-20 px-4 sm:px-6 md:px-12 border-b border-gray-100 dark:border-[#202832] transition-colors duration-250">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-[#171D26] border border-gray-200 dark:border-[#27313D] rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden transition-colors duration-250">
                    
                    {/* Background subtle decoration */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FFDD00]/10 dark:bg-[#FFD600]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        
                        {/* Left: Document Visual Preview Card */}
                        <div className="w-full lg:w-5/12 flex flex-col items-center">
                            <div className="w-full max-w-sm bg-gradient-to-br from-[#0B0F14] via-[#141A22] to-[#1C2430] text-white p-6 sm:p-7 rounded-2xl border border-gray-700/60 shadow-2xl relative group hover:border-[#FFD600]/60 transition-all duration-300">
                                
                                {/* Badge in card */}
                                <div className="flex items-center justify-between gap-2 mb-5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-[#FFDD00] text-black">
                                        Official Catalog
                                    </span>
                                    <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5 text-[#FFDD00]" /> 4 Pages • PDF
                                    </span>
                                </div>

                                {/* Mini cover layout */}
                                <div className="border border-white/10 rounded-xl p-5 bg-white/[0.02] backdrop-blur-sm">
                                    <div className="border-b border-white/10 pb-3 mb-3 text-center">
                                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFDD00] mb-1">
                                            OwnFresh Agro Industries
                                        </div>
                                        <div className="text-lg font-black tracking-tight uppercase text-white">
                                            Official Company Brochure
                                        </div>
                                        <div className="text-[11px] text-gray-300 mt-1 font-medium">
                                            Traditional Stone-Pressed Botanic Pure Edible Oils
                                        </div>
                                    </div>

                                    {/* Feature Pills inside preview */}
                                    <div className="grid grid-cols-2 gap-2 my-4 text-[10px] font-bold text-gray-200">
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-[#FFDD00] shrink-0" />
                                            <span>Stone Mortars</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-1.5">
                                            <Award className="w-3 h-3 text-[#FFDD00] shrink-0" />
                                            <span>16 RPM Extraction</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3 text-[#FFDD00] shrink-0" />
                                            <span>6 Single-Origin Oils</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3 text-[#FFDD00] shrink-0" />
                                            <span>FSSAI Certified</span>
                                        </div>
                                    </div>

                                    <div className="text-center pt-2 border-t border-white/10 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">
                                        Pune, Maharashtra • B2B & Retail
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                                    <span>File size: ~3.9 MB</span>
                                    <span className="text-[#FFDD00] font-bold">Print & Web Ready</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Brochure Details & Action Buttons */}
                        <div className="w-full lg:w-7/12 flex flex-col text-center lg:text-left items-center lg:items-start">
                            
                            <span className="bg-black dark:bg-[#151B23] text-[#FFDD00] dark:text-[#FFD600] border border-transparent dark:border-[#27313D] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full inline-block mb-3">
                                Official Company Publication
                            </span>

                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black dark:text-[#F7F9FC] uppercase tracking-tight mb-3">
                                Explore Our Official Brochure
                            </h2>

                            <p className="text-gray-600 dark:text-[#B7C1CE] text-sm sm:text-base font-normal leading-relaxed mb-6 max-w-xl">
                                Discover OwnFresh Agro Industries, our traditional stone-pressing process, product portfolio, quality standards, and business offerings in our official company brochure.
                            </p>

                            {/* Key Highlights list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8 text-left">
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#24672E] dark:text-[#FFD600] shrink-0 mt-0.5" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#E2E8F0]">
                                        Granite Stone-Pressing & 16 RPM Extraction
                                    </span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#24672E] dark:text-[#FFD600] shrink-0 mt-0.5" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#E2E8F0]">
                                        Complete 6-Oil Portfolio & Chef's Guide
                                    </span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#24672E] dark:text-[#FFD600] shrink-0 mt-0.5" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#E2E8F0]">
                                        Packaging Sizes: 250 mL to 15 L Tins
                                    </span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#24672E] dark:text-[#FFD600] shrink-0 mt-0.5" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#E2E8F0]">
                                        B2B, Retail & Cloud Kitchen Specifications
                                    </span>
                                </div>
                            </div>

                            {/* Call to action buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                                {/* Primary CTA: View / Download Brochure */}
                                <a
                                    href={brochurePdfUrl}
                                    download="OwnFresh-Official-Brochure.pdf"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-black dark:bg-[#FFD600] text-white dark:text-[#101318] hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] hover:text-black font-black uppercase tracking-wider text-xs sm:text-sm px-7 py-4 rounded-xl transition-all duration-300 shadow-md hover:scale-[1.02] cursor-pointer"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>View / Download Brochure</span>
                                </a>

                                {/* Secondary CTA: Open in New Browser Tab */}
                                <a
                                    href={brochurePdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-[#1F2733] text-gray-800 dark:text-[#F7F9FC] hover:bg-gray-50 dark:hover:bg-[#27313D] border border-gray-200 dark:border-[#27313D] hover:border-black dark:hover:border-[#FFD600] font-black uppercase tracking-wider text-xs sm:text-sm px-6 py-4 rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Open in New Tab</span>
                                </a>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default OfficialBrochure;

