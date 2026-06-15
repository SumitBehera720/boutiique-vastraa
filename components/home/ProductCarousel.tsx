"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductCard from '../product/ProductCard';

interface ProductCarouselProps {
  title: string;
  products: any[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif text-primary font-bold text-center mb-10">
          {title}
        </h2>
        
        <div className="relative px-2 md:px-8">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640: { slidesPerView: 2.2, spaceBetween: 20 },
              768: { slidesPerView: 3.2, spaceBetween: 30 },
              1024: { slidesPerView: 4, spaceBetween: 30 },
            }}
            className="pb-12" // Padding for pagination dots
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="h-auto pb-4">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
