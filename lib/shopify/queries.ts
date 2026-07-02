import { jsonDb, Product, Collection, Order, Customer } from '../db/jsonDb';

// Re-map types to match expected Shopify shapes if needed
function formatProduct(p: Product) {
  return {
    ...p,
    // Add default title variant edge if edges are empty
    variants: p.variants || {
      edges: [
        {
          node: {
            id: `${p.id}-default`,
            title: 'Default Title',
            availableForSale: p.availableForSale,
            price: p.priceRange.minVariantPrice,
            compareAtPrice: p.compareAtPriceRange?.minVariantPrice || null,
            selectedOptions: [{ name: 'Title', value: 'Default Title' }]
          }
        }
      ]
    }
  };
}

export async function getProducts(first = 50) {
  const products = jsonDb.getProducts();
  return products.slice(0, first).map(formatProduct);
}

export async function getCollections(first = 20) {
  const collections = jsonDb.getCollections();
  return collections
    .slice(0, first)
    .filter((col) => col.handle !== 'frontpage');
}

export async function getProductByHandle(handle: string) {
  const p = jsonDb.getProductByHandle(handle);
  if (!p) return null;
  return formatProduct(p);
}

export async function getProductRecommendations(productId: string) {
  const products = jsonDb.getProducts();
  const currentProduct = products.find((p) => p.id === productId);
  if (!currentProduct) return [];

  // Recommend products sharing the same collection or tags
  const currentCollections = currentProduct.collectionHandles || [];
  const currentTags = currentProduct.tags || [];

  const recommendations = products
    .filter((p) => {
      if (p.id === productId) return false;
      const sharesCollection = (p.collectionHandles || []).some((c) =>
        currentCollections.includes(c)
      );
      const sharesTag = (p.tags || []).some((t) => currentTags.includes(t));
      return sharesCollection || sharesTag;
    })
    .slice(0, 4)
    .map(formatProduct);

  return recommendations;
}

export async function getCollectionByHandle({
  handle,
  filters = [],
  sortKey = 'COLLECTION_DEFAULT',
  reverse = false,
  first = 24,
  after = null
}: {
  handle: string;
  filters?: any[];
  sortKey?: string;
  reverse?: boolean;
  first?: number;
  after?: string | null;
}) {
  let collection;
  let products;

  if (handle === 'all') {
    collection = {
      id: "gid://shopify/Collection/all",
      title: "All Products",
      handle: "all",
      description: "Browse our complete collection of handcrafted sarees and ethnic apparel.",
      image: {
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80",
        altText: "All Products"
      }
    };
    products = jsonDb.getProducts();
  } else {
    collection = jsonDb.getCollectionByHandle(handle);
    if (!collection) return null;
    products = jsonDb.getProducts().filter((p) =>
      (p.collectionHandles || []).includes(handle)
    );
  }

  // Apply filters
  if (filters && filters.length > 0) {
    products = products.filter((product) => {
      return filters.every((filter) => {
        // Tag filter
        if (filter.tag) {
          return (product.tags || []).some(
            (t) => t.toLowerCase() === filter.tag.toLowerCase()
          );
        }
        // Variant option filter
        if (filter.variantOption) {
          const { name, value } = filter.variantOption;
          return product.variants.edges.some((edge: any) =>
            edge.node.selectedOptions.some(
              (opt: any) =>
                opt.name.toLowerCase() === name.toLowerCase() &&
                opt.value.toLowerCase() === value.toLowerCase()
            )
          );
        }
        // Price filter
        if (filter.price) {
          const price = parseFloat(product.priceRange.minVariantPrice.amount);
          const min = filter.price.min !== undefined ? filter.price.min : 0;
          const max = filter.price.max !== undefined ? filter.price.max : Infinity;
          return price >= min && price <= max;
        }
        return true;
      });
    });
  }

  // Sort products
  if (sortKey === 'PRICE') {
    products.sort((a, b) => {
      const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
      const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
      return reverse ? priceB - priceA : priceA - priceB;
    });
  } else if (sortKey === 'CREATED_AT') {
    // Treat higher ID as newer for mock purposes
    products.sort((a, b) => {
      return reverse ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });
  } else if (sortKey === 'BEST_SELLING') {
    // Sort by bestseller tag first
    products.sort((a, b) => {
      const aBest = a.tags.includes('Bestseller') ? 1 : 0;
      const bBest = b.tags.includes('Bestseller') ? 1 : 0;
      return bBest - aBest;
    });
  } else {
    // COLLECTION_DEFAULT: alpha by title
    products.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Paginate (Simple list-based pagination)
  let paginatedProducts = products;
  let hasNextPage = false;
  let endCursor = '';

  if (after) {
    const index = products.findIndex((p) => p.id === after);
    if (index !== -1) {
      paginatedProducts = products.slice(index + 1);
    }
  }

  if (paginatedProducts.length > first) {
    hasNextPage = true;
    paginatedProducts = paginatedProducts.slice(0, first);
    endCursor = paginatedProducts[paginatedProducts.length - 1].id;
  }

  const productEdges = paginatedProducts.map((p) => ({
    node: formatProduct(p)
  }));

  // Build filters list dynamically from the collection's unfiltered products
  const collectionProducts = jsonDb.getProducts().filter((p) =>
    (p.collectionHandles || []).includes(handle)
  );

  const tagsFilterValuesMap = new Map<string, number>();
  const optionsFilterValuesMap = new Map<string, Map<string, number>>();

  collectionProducts.forEach((product) => {
    // Tags
    product.tags.forEach((tag) => {
      tagsFilterValuesMap.set(tag, (tagsFilterValuesMap.get(tag) || 0) + 1);
    });

    // Options
    product.options.forEach((opt) => {
      if (!optionsFilterValuesMap.has(opt.name)) {
        optionsFilterValuesMap.set(opt.name, new Map<string, number>());
      }
      const valMap = optionsFilterValuesMap.get(opt.name)!;
      opt.values.forEach((val) => {
        // Only count if product has a variant matching this option value
        const hasVariant = product.variants.edges.some((edge: any) =>
          edge.node.selectedOptions.some(
            (o: any) => o.name === opt.name && o.value === val
          )
        );
        if (hasVariant) {
          valMap.set(val, (valMap.get(val) || 0) + 1);
        }
      });
    });
  });

  const generatedFilters: any[] = [];

  // 1. Tag filters
  if (tagsFilterValuesMap.size > 0) {
    generatedFilters.push({
      id: `filter.p.tag`,
      label: 'Tag',
      type: 'LIST',
      values: Array.from(tagsFilterValuesMap.entries()).map(([tag, count]) => ({
        id: `tag-${tag}`,
        label: tag,
        count,
        input: JSON.stringify({ tag })
      }))
    });
  }

  // 2. Options filters
  optionsFilterValuesMap.forEach((valMap, name) => {
    if (valMap.size > 0) {
      generatedFilters.push({
        id: `filter.p.m.custom.${name.toLowerCase().replace(/\s+/g, '_')}`,
        label: name,
        type: 'LIST',
        values: Array.from(valMap.entries()).map(([value, count]) => ({
          id: `opt-${name}-${value}`,
          label: value,
          count,
          input: JSON.stringify({ variantOption: { name, value } })
        }))
      });
    }
  });

  return {
    ...collection,
    products: {
      edges: productEdges,
      pageInfo: {
        hasNextPage,
        endCursor
      },
      filters: generatedFilters
    }
  };
}

export async function searchProducts(
  query: string,
  first = 24,
  after: string | null = null
) {
  const allProducts = jsonDb.getProducts();
  const searchResults = allProducts.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  let paginatedProducts = searchResults;
  let hasNextPage = false;
  let endCursor = '';

  if (after) {
    const index = searchResults.findIndex((p) => p.id === after);
    if (index !== -1) {
      paginatedProducts = searchResults.slice(index + 1);
    }
  }

  if (paginatedProducts.length > first) {
    hasNextPage = true;
    paginatedProducts = paginatedProducts.slice(0, first);
    endCursor = paginatedProducts[paginatedProducts.length - 1].id;
  }

  const productEdges = paginatedProducts.map((p) => ({
    node: formatProduct(p)
  }));

  return {
    edges: productEdges,
    pageInfo: {
      hasNextPage,
      endCursor
    }
  };
}

export async function getCustomer(customerAccessToken: string) {
  // In our local DB, customerAccessToken is either a session token or customer email
  let customer: Customer | null = null;
  if (customerAccessToken.includes('@')) {
    customer = jsonDb.getCustomerByEmail(customerAccessToken);
  } else {
    // If it's a token, let's treat the token as the customer ID or find the customer with ID
    customer = jsonDb.getCustomerById(customerAccessToken);
  }

  if (!customer) return null;

  // Retrieve customer orders
  const allOrders = jsonDb.getOrders();
  const customerOrders = allOrders.filter(
    (o) => o.customerId === customer?.id || o.email === customer?.email
  );

  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone || '',
    defaultAddress: customer.defaultAddress || null,
    orders: {
      edges: customerOrders.map((o) => ({
        node: {
          id: o.id,
          orderNumber: o.orderNumber,
          processedAt: o.processedAt,
          financialStatus: o.financialStatus,
          fulfillmentStatus: o.fulfillmentStatus,
          totalPrice: o.totalPrice,
          lineItems: {
            edges: o.lineItems.map((item) => ({
              node: {
                title: item.title,
                quantity: item.quantity,
                variant: {
                  image: item.image ? { url: item.image } : null
                }
              }
            }))
          }
        }
      }))
    }
  };
}
