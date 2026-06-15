import { getProductRecommendations } from "@/lib/shopify/queries";
import ProductCarousel from "@/components/home/ProductCarousel";

export default async function RelatedProducts({ productId }: { productId: string }) {
  const recommendedProducts = await getProductRecommendations(productId);

  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <ProductCarousel 
      title="You May Also Like" 
      products={recommendedProducts} 
    />
  );
}
