"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Collection {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string } | null;
}

export default function CollectionsSlider({ collections }: { collections: Collection[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section>
      <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Rangoli decoration */}
        <Image
          alt="rangoli"
          width={500}
          height={500}
          className="absolute top-0 left-0 max-h-40 w-auto object-contain opacity-60 sm:max-h-52"
          src="/images/rangoli.png"
          loading="lazy"
        />

        <h1 className="font-kalnia text-maroonClr text-center text-2xl font-medium sm:text-3xl md:text-4xl">
          Our Most Loved Collections
        </h1>

        <div className="mx-auto mt-8 max-w-7xl sm:mt-12 px-4">
          <div ref={scrollRef} className="flex gap-4 sm:gap-8 overflow-x-auto hideScrollbar pb-4 justify-start md:justify-center">
            {collections.slice(0, 6).map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                className="flex flex-col items-center flex-shrink-0 group w-[140px] sm:w-[160px] md:w-[180px]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-full border-[3px] border-goldClr/40 p-1 group-hover:border-goldClr transition-colors duration-300">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-creamClr">
                    {col.image?.url && (
                      <Image
                        src={col.image.url}
                        alt={col.title}
                        fill
                        sizes="(max-width: 768px) 140px, 180px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                  </div>
                </div>
                <h3 className="font-kalnia text-maroonClr text-[15px] sm:text-lg font-medium mt-4 text-center group-hover:text-goldClr transition-colors">
                  {col.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
