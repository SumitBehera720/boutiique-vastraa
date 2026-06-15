"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BannerSlide {
  image: string;
  alt: string;
}

const defaultSlides: BannerSlide[] = [
  { image: "/images/banner-1773659047206-859638957.webp", alt: "New Arrivals" },
  { image: "/images/banner-1773659037696-747582281.webp", alt: "Signature Style" },
  { image: "/images/banner-1773659054836-332868013.webp", alt: "Draping Elegance" },
];

export default function HeroBanner({ slides }: { slides?: BannerSlide[] }) {
  const bannerSlides = slides && slides.length > 0 ? slides : defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const goPrev = () =>
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  const goNext = () =>
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);

  // If all images errored, show a solid color fallback banner
  const allErrored = imageErrors.size >= bannerSlides.length;

  return (
    <section className="relative w-full overflow-hidden bg-maroonClr">
      <div className="relative w-full">
        {allErrored ? (
          /* Fallback: Solid maroon banner with gold text */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-maroonClr via-maroonClr/90 to-maroonClr">
            <div className="absolute top-0 left-0 max-h-32 w-auto opacity-30 sm:max-h-44">
              <Image src="/images/rangoli.png" alt="" width={300} height={300} className="object-contain" />
            </div>
            <div className="absolute bottom-0 right-0 max-h-32 w-auto opacity-30 sm:max-h-44 rotate-180">
              <Image src="/images/rangoli.png" alt="" width={300} height={300} className="object-contain" />
            </div>
            <div className="relative z-10 text-center px-4">
              <h1 className="font-kalnia text-goldClr text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-3">
                New Arrivals
              </h1>
              <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-lg mx-auto">
                Handcrafted sarees sourced from skilled artisans across India
              </p>
            </div>
          </div>
        ) : (
          /* Image slider */
          <div className="w-full flex relative h-[602.55px] sm:h-auto overflow-hidden">
             <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentSlide}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-full flex-shrink-0 relative h-full sm:h-auto"
                >
                  {!imageErrors.has(currentSlide) && (
                    <Image
                      src={bannerSlides[currentSlide].image}
                      alt={bannerSlides[currentSlide].alt}
                      width={1920}
                      height={800}
                      priority={currentSlide === 0}
                      className="w-full h-full sm:h-auto object-cover sm:object-contain"
                      sizes="100vw"
                      onError={() => {
                        setImageErrors((prev) => new Set(prev).add(currentSlide));
                      }}
                    />
                  )}
                </motion.div>
             </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
