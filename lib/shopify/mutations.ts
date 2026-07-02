import { jsonDb, hashPassword, Customer } from '../db/jsonDb';

// Format cart helper to output Shopify GraphQL-like structure
function formatCart(localCart: any) {
  if (!localCart) return null;

  const products = jsonDb.getProducts();
  const edges = localCart.lines.map((line: any) => {
    let matchedVariant: any = null;
    let matchedProduct: any = null;

    for (const p of products) {
      const vEdge = p.variants.edges.find((v: any) => v.node.id === line.merchandiseId);
      if (vEdge) {
        matchedVariant = vEdge.node;
        matchedProduct = p;
        break;
      }
    }

    const variantTitle = matchedVariant ? matchedVariant.title : "Default Title";
    const priceAmount = matchedVariant ? matchedVariant.price.amount : "0.00";
    const currencyCode = matchedVariant ? matchedVariant.price.currencyCode : "INR";
    const productTitle = matchedProduct ? matchedProduct.title : "Unknown Product";
    const productHandle = matchedProduct ? matchedProduct.handle : "";
    const imageUrl = matchedVariant?.image?.url || matchedProduct?.images?.edges[0]?.node?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&auto=format&fit=crop&q=60";
    const altText = matchedVariant?.image?.altText || matchedProduct?.images?.edges[0]?.node?.altText || productTitle;

    return {
      node: {
        id: line.id,
        quantity: line.quantity,
        merchandise: {
          id: line.merchandiseId,
          title: variantTitle,
          product: {
            title: productTitle,
            handle: productHandle
          },
          price: {
            amount: priceAmount,
            currencyCode
          },
          image: {
            url: imageUrl,
            altText
          }
        }
      }
    };
  });

  const totalQuantity = localCart.lines.reduce((sum: number, l: any) => sum + l.quantity, 0);
  const subtotal = localCart.lines.reduce((sum: number, line: any) => {
    let priceAmount = 0;
    for (const p of products) {
      const vEdge = p.variants.edges.find((v: any) => v.node.id === line.merchandiseId);
      if (vEdge) {
        priceAmount = parseFloat(vEdge.node.price.amount);
        break;
      }
    }
    return sum + (priceAmount * line.quantity);
  }, 0);

  return {
    id: localCart.id,
    checkoutUrl: `/checkout?cartId=${localCart.id}`,
    totalQuantity,
    cost: {
      subtotalAmount: {
        amount: subtotal.toFixed(2),
        currencyCode: "INR"
      }
    },
    lines: {
      edges
    }
  };
}

export async function createCart(lines: { merchandiseId: string; quantity: number }[] = []) {
  const cart = jsonDb.createCart(lines);
  return formatCart(cart);
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const cart = jsonDb.addToCart(cartId, lines);
  return formatCart(cart);
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
  const cart = jsonDb.updateCartLines(cartId, lines);
  return formatCart(cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const cart = jsonDb.removeFromCart(cartId, lineIds);
  return formatCart(cart);
}

export async function createCustomer(input: any) {
  const { firstName, lastName, email, password } = input;
  const customers = jsonDb.getCustomers();

  // Check if customer already exists
  const existing = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return {
      customer: null,
      customerUserErrors: [
        {
          code: "TAKEN",
          field: ["email"],
          message: "Email has already been taken."
        }
      ]
    };
  }

  const newCustomer: Customer = {
    id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    firstName,
    lastName,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  customers.push(newCustomer);
  jsonDb.saveCustomers(customers);

  return {
    customer: {
      id: newCustomer.id
    },
    customerUserErrors: []
  };
}

export async function createCustomerAccessToken(input: any) {
  const { email, password } = input;
  const customer = jsonDb.getCustomerByEmail(email);

  if (!customer || customer.passwordHash !== hashPassword(password)) {
    return {
      customerAccessToken: null,
      customerUserErrors: [
        {
          code: "UNAUTHORIZED",
          field: ["email", "password"],
          message: "Unidentified customer, check email and password."
        }
      ]
    };
  }

  // Generate simple token (we use email as the accessToken, or customer ID)
  // Let's use the customer ID as the token to keep it secure-ish and easy to query
  return {
    customerAccessToken: {
      accessToken: customer.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    },
    customerUserErrors: []
  };
}
