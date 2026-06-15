import { shopifyFetch } from './client';

export const getProductsQuery = `
  query($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProducts(first = 50) {
  const { body } = await shopifyFetch<any>({
    query: getProductsQuery,
    variables: { first }
  });
  return body.data.products.edges.map((edge: any) => edge.node);
}

export const getCollectionsQuery = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export async function getCollections(first = 20) {
  const { body } = await shopifyFetch<any>({
    query: getCollectionsQuery,
    variables: { first }
  });
  return body.data.collections.edges
    .map((edge: any) => edge.node)
    .filter((col: any) => col.handle !== 'frontpage');
}

export const getProductByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      options(first: 3) {
        name
        values
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export async function getProductByHandle(handle: string) {
  const { body } = await shopifyFetch<any>({
    query: getProductByHandleQuery,
    variables: { handle }
  });
  return body.data.product;
}

export const getProductRecommendationsQuery = `
  query productRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 2) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
  }
`;

export async function getProductRecommendations(productId: string) {
  const { body } = await shopifyFetch<any>({
    query: getProductRecommendationsQuery,
    variables: { productId }
  });
  return body.data.productRecommendations;
}

export const getCollectionByHandleQuery = `
  query getCollectionByHandle(
    $handle: String!
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int
    $after: String
  ) {
    collection(handle: $handle) {
      id
      title
      description
      image {
        url
        altText
      }
      products(
        first: $first
        after: $after
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        edges {
          node {
            id
            title
            handle
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

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
  const { body } = await shopifyFetch<any>({
    query: getCollectionByHandleQuery,
    variables: { handle, filters, sortKey, reverse, first, after }
  });
  return body.data.collection;
}

export const searchProductsQuery = `
  query searchProducts($query: String!, $first: Int!, $after: String) {
    search(query: $query, first: $first, after: $after, types: PRODUCT) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on Product {
            id
            title
            handle
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function searchProducts(query: string, first = 24, after: string | null = null) {
  const { body } = await shopifyFetch<any>({
    query: searchProductsQuery,
    variables: { query, first, after }
  });
  return body.data.search;
}

// --- Customer Queries ---

export const getCustomerQuery = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        address1
        address2
        city
        province
        country
        zip
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function getCustomer(customerAccessToken: string) {
  const { body } = await shopifyFetch<any>({
    query: getCustomerQuery,
    variables: { customerAccessToken },
    cache: 'no-store'
  });
  return body.data.customer;
}
