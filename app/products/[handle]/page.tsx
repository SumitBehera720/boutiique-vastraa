import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify/queries";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  const product = await getProductByHandle(resolvedParams.handle);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.title} | Boutiique Vastraa`,
    description: product.descriptionHtml.replace(/<[^>]*>?/gm, '').substring(0, 160),
    openGraph: {
      images: product.images.edges.length > 0 ? [product.images.edges[0].node.url] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  const product = await getProductByHandle(resolvedParams.handle);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images.edges[0]?.node.url,
    description: product.descriptionHtml.replace(/<[^>]*>?/gm, '').substring(0, 160),
    brand: {
      '@type': 'Brand',
      name: 'Boutiique Vastraa',
    },
    offers: {
      '@type': 'Offer',
      url: `https://boutiquevastra.com/products/${product.handle}`,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb could go here */}
      <div className="container mx-auto px-4 pt-8 md:pt-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          
          {/* Left: Gallery */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-24">
              <ProductGallery images={product.images.edges} />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2">
            <ProductInfo product={product} />
          </div>

        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20 border-t border-gray-200">
        <RelatedProducts productId={product.id} />
      </div>
    </div>
  );
}
