export async function shopifyFetch<T>({
  query,
  variables = {},
  tags = [],
  cache = 'force-cache'
}: {
  query: string;
  variables?: any;
  tags?: string[];
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !token) {
    throw new Error('Missing Shopify Environment Variables');
  }

  // Exact endpoint from Vite proxy
  const endpoint = `${domain}/api/2024-04/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      }),
      cache,
      ...(tags && { next: { tags } })
    });

    const body = await result.json();

    if (body.errors) {
      console.error('Shopify GraphQL Errors:', body.errors);
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    console.error('Error fetching from Shopify:', e);
    throw e;
  }
}
