"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ProductGallery({ images }: { images: any[] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  if (!images || images.length === 0) return <div className="aspect-[3/4] bg-gray-200"></div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <Swiper
        style={{
          "--swiper-navigation-color": "#800020",
          "--swiper-pagination-color": "#800020",
        } as any}
        loop={true}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="w-full rounded-lg aspect-[3/4] bg-gray-50"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full group overflow-hidden cursor-crosshair">
              <Image 
                src={img.node.url} 
                alt={img.node.altText || "Product Image"} 
                fill 
                priority={index === 0}
                className="object-cover group-hover:scale-150 transition-transform duration-500 origin-center" 
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Gallery */}
      <Swiper
        onSwiper={setThumbsSwiper}
        loop={true}
        spaceBetween={10}
        slidesPerView={5}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="w-full h-24"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index} className="cursor-pointer opacity-60 [&.swiper-slide-thumb-active]:opacity-100 transition-opacity [&.swiper-slide-thumb-active>div]:border-maroonClr [&.swiper-slide-thumb-active>div]:border-2">
            <div className="relative w-full h-full rounded border border-gray-200 overflow-hidden">
              <Image 
                src={img.node.url} 
                alt={img.node.altText || "Thumbnail"} 
                fill 
                className="object-cover" 
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
