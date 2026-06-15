import { Metadata } from 'next';
import { getProducts, getCollections } from "@/lib/shopify/queries";
import CollectionsSlider from "@/components/home/CollectionsSlider";
import PatternBanner from "@/components/home/PatternBanner";
import TopSellings from "@/components/home/TopSellings";
import PerfectSareeTabs from "@/components/home/PerfectSareeTabs";
import BestCategories from "@/components/home/BestCategories";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqAccordion from "@/components/home/FaqAccordion";
import HeroBanner from "@/components/home/HeroBanner";

export const metadata: Metadata = {
  title: "Boutiique Vastraa",
  description: "Handcrafted sarees sourced from skilled artisans across India, including the rich brocades of Banarasi silks.",
  openGraph: {
    type: 'website',
    url: 'https://boutiquevastra.com',
    title: "Boutiique Vastraa",
    description: "Handcrafted sarees sourced from skilled artisans across India.",
    siteName: 'Boutiique Vastraa',
  },
};

export default async function Home() {
  // Fetch live data from Shopify
  const allProducts = await getProducts(24);
  const allCollections = await getCollections(20);

  // Map collections for components
  const collectionsWithImages = allCollections.map((c: any) => ({
    id: c.id,
    title: c.title,
    handle: c.handle,
    image: c.image || null,
  }));

  // Build tabs from collections for PerfectSareeTabs
  const { getCollectionByHandle } = await import("@/lib/shopify/queries");
  const tabs = await Promise.all(
    allCollections.slice(0, 10).map(async (col: any) => {
      try {
        const colData = await getCollectionByHandle({ handle: col.handle, first: 8 });
        return {
          label: col.title,
          image: col.image?.url || null,
          products: colData?.products?.edges?.map((e: any) => e.node) || [],
        };
      } catch (e) {
        return {
          label: col.title,
          image: col.image?.url || null,
          products: [],
        };
      }
    })
  );

  return (
    <>
      {/* Hero Banner - user provided banner images */}
      <HeroBanner />

      {/* Section 1: Our Most Loved Collections */}
      <CollectionsSlider collections={collectionsWithImages} />

      {/* Section 2: Pattern Banner */}
      <PatternBanner />

      {/* Section 3: Top-Sellings */}
      <TopSellings products={allProducts.slice(0, 10)} />

      {/* Section 4: Find Your Perfect Saree (Tabs) */}
      <PerfectSareeTabs tabs={tabs} />

      {/* Section 5: Explore Best Categories */}
      <BestCategories collections={collectionsWithImages} />

      {/* Section 6 + 7 + 8: Maroon Section (Features + Testimonials + FAQ) */}
      <section className="bg-maroonClr">
        {/* Section 6: Features Grid */}
        <FeaturesGrid />

        {/* Section 7: Testimonials */}
        <div className="px-4 md:px-6 pb-12 sm:pb-16 md:pb-20">
          <TestimonialsSection />
        </div>

        {/* Section 8: FAQ Accordion */}
        <FaqAccordion />
      </section>
    </>
  );
}
