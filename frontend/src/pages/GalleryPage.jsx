import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { RxCross2 } from 'react-icons/rx';
import { FaInstagram, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import SEO from '../components/SEO';

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

/* Gallery Data */
/* Certifications (Kept separate and static per requirements) */
const staticCertifications = [
  {
    id: 10,
    src: 'https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961102/ownfresh_media/vwylvev18xuvlp7pdak8.jpg',
    alt: 'FSSAI Certification',
    category: 'Certifications',
    caption: 'Government Registered Quality (FSSAI)',
  },
  {
    id: 11,
    src: 'https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961151/ownfresh_media/entjvm79dktv5e8ekvmx.jpg',
    alt: 'Quality Standard',
    category: 'Certifications',
    caption: 'Rigorous Quality Checks & Monitoring',
  },
  {
    id: 12,
    src: 'https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961219/ownfresh_media/cqfid9v0hfqenb0zezwx.png',
    alt: 'Process Standard',
    category: 'Certifications',
    caption: 'Standardized Oil Extraction Practices',
  },
  {
    id: 13,
    src: 'https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961250/ownfresh_media/y7denrhgp9vpmbxjk5om.png',
    alt: 'Trust Mark',
    category: 'Certifications',
    caption: 'Botanic Purity Verified Mark',
  },
  {
    id: 14,
    src: 'https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961287/ownfresh_media/mpvtpafstuox80colfej.png',
    alt: 'Compliance Certification',
    category: 'Certifications',
    caption: 'Certified Production & Safety Compliance',
  },
];

const CATEGORIES = ['All', 'Our Oils', 'Extraction', 'Ingredients', 'Culinary', 'Certifications', 'Community'];

/* ─── Lightbox Component ────────────────────────────────────── */
const Lightbox = ({ images, index, onClose }) => {
  const [current, setCurrent] = useState(index);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  const img = images[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative max-w-4xl w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-white hover:text-[#FFDD00] transition-all bg-black/40 hover:bg-black/60 p-2 rounded-full z-10"
          onClick={onClose}
        >
          <RxCross2 size={24} />
        </button>

        {/* Image */}
        <div
          className="relative w-full"
          onContextMenu={img.category === 'Certifications' ? (e) => e.preventDefault() : undefined}
        >
          <img
            src={img.src}
            alt={img.alt}
            className={`w-full max-h-[75vh] object-contain rounded-sm shadow-2xl ${img.category === 'Certifications' ? 'select-none' : ''}`}
            onContextMenu={img.category === 'Certifications' ? (e) => e.preventDefault() : undefined}
            onDragStart={img.category === 'Certifications' ? (e) => e.preventDefault() : undefined}
          />

          {/* Prev / Next */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white hover:text-[#FFDD00] transition-colors flex items-center justify-center z-10 sm:-left-16 sm:bg-transparent"
          >
            <FaChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white hover:text-[#FFDD00] transition-colors flex items-center justify-center z-10 sm:-right-16 sm:bg-transparent"
          >
            <FaChevronRight size={20} />
          </button>
        </div>

        {/* Caption */}
        <p className="text-white/80 text-sm font-medium mt-4 text-center">{img.caption}</p>

        {/* Dots */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-6 max-w-[80vw]">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-[#FFDD00] w-4' : 'bg-white/30'
                }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Gallery Page ─────────────────────────────────────── */
const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [searchParams] = useSearchParams();
  const [dynamicImages, setDynamicImages] = useState([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/gallery`);
        if (res.data.success) {
          setDynamicImages(res.data.images || []);
        }
      } catch (error) {
        console.error("Failed to load gallery from backend", error);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  // Combine dynamic backend images (normalized) with static certifications
  const allImages = [
    ...dynamicImages.map((img) => ({
      id: img._id,
      src: img.imageUrl,
      alt: img.title,
      category: img.category,
      caption: img.description || img.title,
    })),
    ...staticCertifications,
  ];

  const filtered =
    activeCategory === 'All'
      ? allImages
      : activeCategory === 'Certifications'
        ? staticCertifications
        : allImages.filter((img) => img.category === activeCategory);

  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Own Fresh",
    "url": "https://myownfresh.com",
    "logo": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png",
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "FSSAI Certification",
        "credentialCategory": "Government Registered Food Safety and Standards Authority of India (FSSAI) Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "FSSAI (Food Safety and Standards Authority of India)"
        },
        "image": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961102/ownfresh_media/vwylvev18xuvlp7pdak8.jpg"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Quality Standard Certification",
        "credentialCategory": "Rigorous Quality Standards & Process Monitoring Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "Own Fresh Quality Control Division"
        },
        "image": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961151/ownfresh_media/entjvm79dktv5e8ekvmx.jpg"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Process Standard Certification",
        "credentialCategory": "Standardized Traditional Stone-Pressing Extraction Practices Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "Own Fresh Manufacturing Standards"
        },
        "image": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961219/ownfresh_media/cqfid9v0hfqenb0zezwx.png"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Botanic Purity Verified Mark",
        "credentialCategory": "Purity Verification of Raw Materials Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "Botanic Purity Assurance Division"
        },
        "image": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961250/ownfresh_media/y7denrhgp9vpmbxjk5om.png"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Compliance Certification",
        "credentialCategory": "Certified Production and Safety Compliance Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "Production Safety Compliance Board"
        },
        "image": "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774961287/ownfresh_media/mpvtpafstuox80colfej.png"
      }
    ]
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0B0F14] transition-colors duration-200">
      <SEO
        title="Gallery - Verification & Certifications"
        description="Explore the visual journey of Own Fresh, showcasing our traditional stone-pressing processes, premium raw materials, and verified certifications (FSSAI)."
        schemaMarkup={gallerySchema}
      />
      <Navbar />

      {/* ── Page Header ── */}
      <section className="pt-28 md:pt-12 pb-12 px-6 bg-white dark:bg-[#0B0F14] text-center">
        <p className="text-[#FFDD00] dark:text-[#FFD600] text-[10px] md:text-sm font-black uppercase tracking-[0.4em] mb-4">
          Visual Journey
        </p>
        <h1 className="text-4xl md:text-7xl font-black text-black dark:text-[#F7F9FC] uppercase tracking-tighter leading-none">
          Our Gallery
        </h1>
        <div className="w-16 h-1 mt-6 mx-auto bg-black dark:bg-[#FFD600]" />
        <p className="max-w-2xl mx-auto mt-8 text-gray-500 dark:text-[#B7C1CE] text-sm md:text-lg font-medium leading-relaxed px-4">
          At OwnFresh, every image tells a story of authenticity, tradition, and dedication.
          Experience the essence of purity through our lens.
        </p>
      </section>

      {/* ── Featured Banner (Fully Mobile Responsive) ── */}
      <section className="w-full px-3 sm:px-6 md:px-10 max-w-7xl mx-auto mb-10 md:mb-16">
        <div className="rounded-2xl md:rounded-[40px] overflow-hidden shadow-xl border border-gray-100 dark:border-[#27313D] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#171D26] dark:to-[#111720] flex items-center justify-center p-1 sm:p-2">
          <img
            src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1775113294/ownfresh_media/ci9yurjbwfpag9kth97u.png"
            alt="OwnFresh Series Banner"
            className="w-full h-auto object-contain max-h-[220px] sm:max-h-[360px] md:max-h-[500px] rounded-xl md:rounded-[36px]"
          />
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="w-full bg-[#fafafa] dark:bg-[#111720] border-b border-gray-100 dark:border-[#202832] py-4 px-4 flex justify-start md:justify-center overflow-x-auto hide-scrollbar snap-x snap-mandatory">
        <div className="flex gap-2 snap-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all duration-200 snap-start whitespace-nowrap cursor-pointer ${activeCategory === cat
                ? 'bg-black dark:bg-[#FFD600] text-[#FFDD00] dark:text-[#101318] border-black dark:border-[#FFD600]'
                : 'bg-white dark:bg-[#171D26] text-black dark:text-[#B7C1CE] border-gray-300 dark:border-[#27313D] hover:border-black dark:hover:border-[#FFD600] dark:hover:text-[#F5F7FA]'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Masonry Grid ── */}
      <section className="w-full py-8 md:py-20 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto columns-2 sm:columns-2 md:columns-3 lg:columns-3 gap-3 space-y-3">
          {filtered.map((img, i) => (
            <div
              key={img.id}
              className="group relative break-inside-avoid overflow-hidden bg-gray-100 dark:bg-[#171D26] border dark:border-[#27313D] rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              onClick={() => setLightboxIndex(i)}
              onContextMenu={img.category === 'Certifications' ? (e) => e.preventDefault() : undefined}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 ${img.category === 'Certifications' ? 'select-none' : ''}`}
                loading="lazy"
                onContextMenu={img.category === 'Certifications' ? (e) => e.preventDefault() : undefined}
                onDragStart={img.category === 'Certifications' ? (e) => e.preventDefault() : undefined}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 md:bg-black/0 md:group-hover:bg-black/50 transition-all duration-300 flex flex-col items-center justify-center gap-1.5">
                <span className="text-white font-black uppercase tracking-widest text-[9px] md:text-xs border-2 border-white px-2 py-1 md:px-4 md:py-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300">
                  View
                </span>
                <span className="text-white/95 text-[10px] md:text-xs font-semibold px-2 text-center opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-500 delay-75 line-clamp-1">
                  {img.caption}
                </span>
              </div>
              {/* Category badge */}
              <span className="absolute top-2 left-2 bg-[#FFDD00] dark:bg-[#FFD600] text-black text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 rounded-sm">
                {img.category}
              </span>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-[#818C9B] font-bold uppercase tracking-widest text-sm">
            No images in this category yet.
          </div>
        )}
      </section>

      {/* ── Instagram section ── */}
      <section className="w-full bg-black dark:bg-[#080B10] border-t dark:border-[#202731] text-white py-16 px-6 text-center">
        <FaInstagram size={36} className="mx-auto mb-4 text-[#FFDD00] dark:text-[#FFD600]" />
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-3 text-white dark:text-[#F7F9FC]">
          Follow Us on Instagram
        </h2>
        <p className="text-white/60 dark:text-[#8C97A6] font-medium mb-6 max-w-md mx-auto text-sm">
          🥜 Pure. Natural. Truly Fresh. — Stay connected for daily content, recipes & offers.
        </p>
        <a
          href="https://www.instagram.com/ownfresh_official/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#FFDD00] dark:bg-[#FFD600] text-black font-black uppercase text-xs tracking-widest px-8 py-3 rounded-xl hover:bg-white dark:hover:bg-[#FFE45C] transition-colors duration-200"
        >
          <FaInstagram size={16} /> @ownfresh_official
        </a>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={filtered}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default GalleryPage;
