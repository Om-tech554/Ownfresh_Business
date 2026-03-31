import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { RxCross2 } from 'react-icons/rx';
import { FaInstagram, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

/* Gallery Data */
const galleryImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1200&auto=format&fit=crop',
    alt: 'Stone-pressed oil process',
    category: 'Process',
    caption: 'From Soil to Oil - Traditional stone-pressing',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=1200&auto=format&fit=crop',
    alt: 'Pure sesame oil',
    category: 'Products',
    caption: '100% Pure Sesame Oil - No additives',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1598202493891-8f1c6fe5bc4e?q=80&w=1200&auto=format&fit=crop',
    alt: 'Groundnut oil in kitchen',
    category: 'Kitchen',
    caption: 'Kitchen Inspirations - Cook with purity',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1519699047748-de8e44a9f0aa?q=80&w=1200&auto=format&fit=crop',
    alt: 'Handpicked seeds',
    category: 'Ingredients',
    caption: "Nature's Best - Handpicked nuts & seeds",
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&auto=format&fit=crop',
    alt: 'Healthy meal with OwnFresh oil',
    category: 'Kitchen',
    caption: 'Healthy Cooking - Every meal made better',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1596728073577-fb5ac8680008?q=80&w=1200&auto=format&fit=crop',
    alt: 'Oil pouring shot',
    category: 'Products',
    caption: 'Purity in Every Drop',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
    alt: 'Community celebration',
    category: 'Community',
    caption: 'Community & Celebrations',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200&auto=format&fit=crop',
    alt: 'Farm to bottle',
    category: 'Process',
    caption: 'Farm to Bottle - 100% Traceable',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1200&auto=format&fit=crop',
    alt: 'Customer experience',
    category: 'Community',
    caption: 'Happy Customers Across India',
  },
];

const CATEGORIES = ['All', 'Products', 'Process', 'Kitchen', 'Ingredients', 'Community'];

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
          className="absolute -top-10 right-0 text-white hover:text-[#EFDB27] transition-colors"
          onClick={onClose}
        >
          <RxCross2 size={28} />
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-4 text-white hover:text-[#EFDB27] transition-colors hidden sm:block"
          >
            <FaChevronLeft size={32} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-4 text-white hover:text-[#EFDB27] transition-colors hidden sm:block"
          >
            <FaChevronRight size={32} />
          </button>
        </div>

        {/* Caption */}
        <p className="text-white/80 text-sm font-medium mt-4 text-center">{img.caption}</p>

        {/* Dots */}
        <div className="flex gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-[#EFDB27] w-5' : 'bg-white/40'
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

  const filtered =
    activeCategory === 'All'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[260px] md:h-[360px] overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1596728073577-fb5ac8680008?q=80&w=1600&auto=format&fit=crop"
          alt="Gallery Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative text-center px-4">
          <p className="text-[#EFDB27] text-xs font-bold uppercase tracking-[0.3em] mb-3">
            Visual Journey
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">
            Our Gallery
          </h1>
          <div className="w-16 h-1 bg-[#EFDB27] mx-auto mt-5" />
          <p className="text-white/70 mt-4 text-sm md:text-base font-medium max-w-lg mx-auto">
            At OwnFresh, every image tells a story of authenticity, tradition, and dedication.
            Witness the essence of purity come to life.
          </p>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="w-full bg-[#fafafa] border-b border-gray-100 py-5 px-6 flex justify-center">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest border transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-black text-[#EFDB27] border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Masonry Grid ── */}
      <section className="w-full py-16 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
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
              <span className="absolute top-3 left-3 bg-[#EFDB27] text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        <FaInstagram size={36} className="mx-auto mb-4 text-[#EFDB27]" />
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
          className="inline-flex items-center gap-2 bg-[#EFDB27] text-black font-black uppercase text-xs tracking-widest px-8 py-3 hover:bg-white transition-colors duration-200"
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
