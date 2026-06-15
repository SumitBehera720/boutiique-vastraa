import { MetadataRoute } from 'next';
import { getCollections, getProducts } from '@/lib/shopify/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boutiquevastra.com';

  // Fetch dynamic routes
  const products = await getProducts(100);
  const collections = await getCollections(100);

  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.handle}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const collectionUrls = collections.map((collection: any) => ({
    url: `${baseUrl}/collections/${collection.handle}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/collections/all`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...collectionUrls, ...productUrls];
}
