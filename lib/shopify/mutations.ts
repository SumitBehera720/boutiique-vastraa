import { shopifyFetch } from './client';

export const cartCreateMutation = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
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
  }
`;

export const cartLinesAddMutation = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
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
  }
`;

export const cartLinesUpdateMutation = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
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
  }
`;

export const cartLinesRemoveMutation = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
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
  }
`;

export async function createCart(lines: { merchandiseId: string; quantity: number }[] = []) {
  const { body } = await shopifyFetch<any>({
    query: cartCreateMutation,
    variables: { input: { lines } }
  });
  return body.data.cartCreate.cart;
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const { body } = await shopifyFetch<any>({
    query: cartLinesAddMutation,
    variables: { cartId, lines }
  });
  return body.data.cartLinesAdd.cart;
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
  const { body } = await shopifyFetch<any>({
    query: cartLinesUpdateMutation,
    variables: { cartId, lines }
  });
  return body.data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const { body } = await shopifyFetch<any>({
    query: cartLinesRemoveMutation,
    variables: { cartId, lineIds }
  });
  return body.data.cartLinesRemove.cart;
}

// --- Customer Auth Mutations ---

export const customerCreateMutation = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const customerAccessTokenCreateMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function createCustomer(input: any) {
  const { body } = await shopifyFetch<any>({
    query: customerCreateMutation,
    variables: { input }
  });
  return body.data.customerCreate;
}

export async function createCustomerAccessToken(input: any) {
  const { body } = await shopifyFetch<any>({
    query: customerAccessTokenCreateMutation,
    variables: { input }
  });
  return body.data.customerAccessTokenCreate;
}
