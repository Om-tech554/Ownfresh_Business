import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { RxCross2 } from 'react-icons/rx';
import { FaInstagram, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { useSearchParams } from 'react-router-dom';

/* Gallery Data */
const galleryImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1200&auto=format&fit=crop',
    alt: 'Stone-pressed oil process',
    category: 'Extraction',
    caption: 'From Soil to Oil - Traditional stone-pressing',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=1200&auto=format&fit=crop',
    alt: 'Pure sesame oil',
    category: 'Our Oils',
    caption: '100% Pure Sesame Oil - No additives',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?q=80&w=1200&auto=format&fit=crop',
    alt: 'Groundnut oil in kitchen',
    category: 'Culinary',
    caption: 'Kitchen Inspirations - Cook with purity',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1519996529931-28324d5a1f6a?q=80&w=1200&auto=format&fit=crop',
    alt: 'Handpicked seeds',
    category: 'Ingredients',
    caption: "Nature's Best - Handpicked nuts & seeds",
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1606914469725-e398d2f1d7ee?q=80&w=1200&auto=format&fit=crop',
    alt: 'Healthy meal with OwnFresh oil',
    category: 'Culinary',
    caption: 'Healthy Cooking - Every meal made better',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1600271881734-60ef0e5cb15b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Oil pouring shot',
    category: 'Our Oils',
    caption: 'Purity in Every Drop',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    alt: 'Community celebration',
    category: 'Community',
    caption: 'Community & Celebrations',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?q=80&w=1200&auto=format&fit=crop',
    alt: 'Farm to bottle',
    category: 'Extraction',
    caption: 'Farm to Bottle - 100% Traceable',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1200&auto=format&fit=crop',
    alt: 'Customer experience',
    category: 'Community',
    caption: 'Happy Customers Across India',
  },
  /* Certifications */
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
    <div
      className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-white hover:text-[#F9DD19] transition-all bg-black/40 hover:bg-black/60 p-2 rounded-full z-10"
          onClick={onClose}
        >
          <RxCross2 size={24} />
        </button>

        {/* Image */}
        <div className="relative w-full">
          <img
            src={img.src}
            alt={img.alt}
            className="w-full max-h-[75vh] object-contain rounded-sm shadow-2xl"
          />

          {/* Prev / Next */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-4 text-white hover:text-[#F9DD19] transition-colors hidden sm:block"
          >
            <FaChevronLeft size={32} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-4 text-white hover:text-[#F9DD19] transition-colors hidden sm:block"
          >
            <FaChevronRight size={32} />
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
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-[#F9DD19] w-4' : 'bg-white/30'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Gallery Page ─────────────────────────────────────── */
const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  const filtered =
    activeCategory === 'All'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />

      {/* ── Page Header ── */}
      <section className="pt-28 md:pt-12 pb-12 px-6 bg-white text-center">
        <p className="text-[#F9DD19] text-[10px] md:text-sm font-black uppercase tracking-[0.4em] mb-4">
          Visual Journey
        </p>
        <h1 className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter leading-none">
          Our Gallery
        </h1>
        <div className="w-16 h-1 mt-6 mx-auto bg-black" />
        <p className="max-w-2xl mx-auto mt-8 text-gray-500 text-sm md:text-lg font-medium leading-relaxed px-4">
          At OwnFresh, every image tells a story of authenticity, tradition, and dedication.
          Experience the essence of purity through our lens.
        </p>
      </section>

      {/* ── Featured Banner (Clean & Visible) ── */}
      <section className="w-full px-4 md:px-10 max-w-7xl mx-auto mb-16">
        <div className="rounded-2xl md:rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 bg-gray-50">
          <img
            src="//res.cloudinary.com/dkhq2wlwg/image/upload/v1775113294/ownfresh_media/ci9yurjbwfpag9kth97u.png"
            alt="OwnFresh Series Banner"
            className="w-full h-auto object-cover min-h-[180px] md:min-h-[300px]"
          />
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="w-full bg-[#fafafa] border-b border-gray-100 py-5 px-6 flex justify-center">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest border transition-all duration-200 ${activeCategory === cat
                ? 'bg-black text-[#F9DD19] border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Masonry Grid ── */}
      <section className="w-full py-12 md:py-20 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto columns-1 sm:columns-2 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((img, i) => (
            <div
              key={img.id}
              className="group relative break-inside-avoid overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                <span className="text-white font-black uppercase tracking-widest text-xs border-2 border-white px-4 py-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  View
                </span>
                <span className="text-white/80 text-xs font-medium px-4 text-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
                  {img.caption}
                </span>
              </div>
              {/* Category badge */}
              <span className="absolute top-3 left-3 bg-[#F9DD19] text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {img.category}
              </span>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-sm">
            No images in this category yet.
          </div>
        )}
      </section>

      {/* ── Instagram section ── */}
      <section className="w-full bg-black text-white py-16 px-6 text-center">
        <FaInstagram size={36} className="mx-auto mb-4 text-[#F9DD19]" />
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-3">
          Follow Us on Instagram
        </h2>
        <p className="text-white/60 font-medium mb-6 max-w-md mx-auto text-sm">
          🥜 Pure. Natural. Truly Fresh. — Stay connected for daily content, recipes & offers.
        </p>
        <a
          href="https://www.instagram.com/ownfresh_official/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#F9DD19] text-black font-black uppercase text-xs tracking-widest px-8 py-3 hover:bg-white transition-colors duration-200"
        >
          <FaInstagram size={16} /> @ownfresh_official
        </a>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default GalleryPage;
