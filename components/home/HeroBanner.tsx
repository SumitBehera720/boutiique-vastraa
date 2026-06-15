"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-[#FDFBF7]">
      <motion.div
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="https://cdn.shopify.com/s/files/1/0878/1827/3052/files/Web_Banner_-_Boutiique_Vastraa.png?v=1714488390" // Placeholder from reference, ideally comes from Shopify Theme Settings or Metafields
          alt="Boutiique Vastraa Signature Collection"
          fill
          className="object-cover object-center"
          priority
        />
      </motion.div>

      {/* Fade-in Text Overlay */}
      <div className="absolute inset-0 bg-black/20 flex flex-col justify-end items-center pb-12 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-center"
        >
          <h1 className="text-white font-serif text-5xl md:text-7xl font-bold tracking-widest drop-shadow-lg">
            SIGNATURE
          </h1>
          <p className="text-white text-lg md:text-xl font-medium tracking-widest mt-2 uppercase drop-shadow-md">
            Collection
          </p>
        </motion.div>
      </div>
    </section>
  );
}
