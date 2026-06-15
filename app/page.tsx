import { getProducts, getCollections } from '@/lib/shopify/queries';
import HeroBanner from '@/components/home/HeroBanner';
import CollectionSlider from '@/components/home/CollectionSlider';
import PromoBanner from '@/components/home/PromoBanner';
import ProductCarousel from '@/components/home/ProductCarousel';
import TestimonialSlider from '@/components/home/TestimonialSlider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Boutiique Vastraa | Premium Women's Ethnic Wear",
  description: "Shop our exclusive range of luxury sarees, designer kurtis, and jewellery.",
  openGraph: {
    type: 'website',
    url: 'https://boutiquevastra.com',
    title: "Boutiique Vastraa | Premium Women's Ethnic Wear",
    description: "Shop our exclusive range of luxury sarees, designer kurtis, and jewellery.",
    siteName: 'Boutiique Vastraa',
  },
  twitter: {
    card: 'summary_large_image',
  }
};

export default async function Home() {
  // Fetch live data from Shopify Storefront API
  const products = await getProducts(10);
  const collections = await getCollections(6);

  return (
    <>
      <HeroBanner />
      
      {collections && collections.length > 0 && (
        <CollectionSlider collections={collections} />
      )}
      
      <PromoBanner />
      
      {products && products.length > 0 && (
        <ProductCarousel title="New Arrivals" products={products} />
      )}
      
      <TestimonialSlider />
    </>
  );
}
