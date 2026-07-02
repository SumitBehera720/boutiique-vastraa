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
import { jsonDb } from "@/lib/db/jsonDb";

export async function generateMetadata(): Promise<Metadata> {
  const settings = jsonDb.getSettings();
  const cleanTitle = settings.seo.titleTemplate
    ? settings.seo.titleTemplate.replace("%s | ", "")
    : "Boutiique Vastraa";
  return {
    title: "Home | " + cleanTitle,
    description: settings.seo.defaultDescription,
    openGraph: {
      type: 'website',
      url: 'https://boutiquevastra.com',
      title: cleanTitle,
      description: settings.seo.defaultDescription,
      siteName: 'Boutiique Vastraa',
    },
  };
}

export default async function Home() {
  // Load settings for homepage hero slideshow
  const settings = jsonDb.getSettings();
  const homeSettings = settings.homepage || {};
  const bannerSlides = settings.banners.map((b) => ({
    image: b.imageUrl,
    alt: b.title,
  }));

  // Load verified testimonials
  const dbReviews = jsonDb.getGlobalReviews();
  const customTestimonials = dbReviews.map((r, idx) => {
    const avatars = [
      "/images/client-1.jpg",
      "/images/client-2.jpg",
      "/images/client-3.jpg",
      "/images/client-4.jpg",
      "/images/client-5.jpg"
    ];
    return {
      name: r.author,
      role: "Verified Buyer",
      quote: r.comment,
      image: avatars[idx % avatars.length]
    };
  });

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
      <HeroBanner slides={bannerSlides} />

      {/* Section 1: Our Most Loved Collections */}
      <CollectionsSlider collections={collectionsWithImages} title={homeSettings.lovedCollectionsTitle} />

      {/* Section 2: Pattern Banner */}
      <PatternBanner heading={homeSettings.patternBanner?.heading} />

      {/* Section 3: Top-Sellings */}
      <TopSellings 
        products={allProducts.slice(0, 10)} 
        title={homeSettings.trendingTitle} 
        subtitle={homeSettings.trendingSubtitle} 
      />

      {/* Section 4: Find Your Perfect Saree (Tabs) */}
      <PerfectSareeTabs 
        tabs={tabs} 
        title={homeSettings.perfectSareeTitle} 
        subtitle={homeSettings.perfectSareeSubtitle} 
      />

      {/* Section 5: Explore Best Categories */}
      <BestCategories 
        collections={collectionsWithImages} 
        title={homeSettings.categoriesTitle} 
        subtitle={homeSettings.categoriesSubtitle} 
      />

      {/* Section 6 + 7 + 8: Maroon Section (Features + Testimonials + FAQ) */}
      <section className="bg-maroonClr">
        {/* Section 6: Features Grid */}
        <FeaturesGrid 
          title={homeSettings.featuresTitle} 
          subtitle={homeSettings.featuresSubtitle} 
          features={homeSettings.features} 
        />

        {/* Section 7: Testimonials */}
        <div className="px-4 md:px-6 pb-12 sm:pb-16 md:pb-20">
          <TestimonialsSection customTestimonials={customTestimonials} />
        </div>

        {/* Section 8: FAQ Accordion */}
        <FaqAccordion 
          title={homeSettings.faqTitle} 
          subtitle={homeSettings.faqSubtitle} 
          image={homeSettings.faqImage} 
          faqs={homeSettings.faqs} 
        />
      </section>
    </>
  );
}
