"use server";

import { jsonDb, Order, Product } from "@/lib/db/jsonDb";
import { cookies } from "next/headers";

// Helper to format cart items in the same way mutations does
function formatCart(localCart: any) {
  if (!localCart) return null;

  const products = jsonDb.getProducts();
  const lines = localCart.lines.map((line: any) => {
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
    const imageUrl = matchedVariant?.image?.url || matchedProduct?.images?.edges[0]?.node?.url || "";

    return {
      id: line.id,
      quantity: line.quantity,
      merchandiseId: line.merchandiseId,
      title: productTitle,
      variantTitle: variantTitle,
      handle: productHandle,
      price: priceAmount,
      currencyCode,
      image: imageUrl
    };
  });

  const totalQuantity = localCart.lines.reduce((sum: number, l: any) => sum + l.quantity, 0);
  const subtotal = localCart.lines.reduce((sum: number, line: any) => {
    const item = lines.find((l: any) => l.id === line.id);
    const price = item ? parseFloat(item.price) : 0;
    return sum + (price * line.quantity);
  }, 0);

  return {
    id: localCart.id,
    totalQuantity,
    subtotal: subtotal.toFixed(2),
    lines
  };
}

export async function getCartForCheckoutAction(cartId: string) {
  try {
    const cart = jsonDb.getCart(cartId);
    if (!cart) return { success: false, error: "Cart not found" };
    return { success: true, cart: formatCart(cart) };
  } catch (error) {
    console.error("Get Cart for Checkout Error:", error);
    return { success: false, error: "Failed to load checkout cart details" };
  }
}

export async function submitOrderAction(formData: {
  cartId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  paymentMethod: "COD" | "CARD";
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  promoCode?: string;
}) {
  try {
    // 1. Get the cart
    const cart = jsonDb.getCart(formData.cartId);
    if (!cart || cart.lines.length === 0) {
      return { success: false, error: "Your cart is empty or expired" };
    }

    const formattedCart = formatCart(cart);
    if (!formattedCart) {
      return { success: false, error: "Failed to format cart" };
    }

    // 2. Decrement inventory and check availability
    const products = jsonDb.getProducts();
    const updatedProducts = [...products];

    for (const line of cart.lines) {
      // Find product
      let productIndex = -1;
      let variantFound = false;

      for (let i = 0; i < updatedProducts.length; i++) {
        const hasVariant = updatedProducts[i].variants.edges.some(
          (edge: any) => edge.node.id === line.merchandiseId
        );
        if (hasVariant) {
          productIndex = i;
          variantFound = true;
          break;
        }
      }

      if (productIndex !== -1) {
        const product = updatedProducts[productIndex];
        
        // Decrement product inventory
        if (product.inventory !== undefined) {
          if (product.inventory < line.quantity) {
            return {
              success: false,
              error: `Insufficient stock for product "${product.title}". Only ${product.inventory} items left.`
            };
          }
          product.inventory -= line.quantity;
          if (product.inventory <= 0) {
            product.availableForSale = false;
          }
        }
      }
    }

    // 3. Resolve customer ID if logged in
    const cookieStore = await cookies();
    const customerToken = cookieStore.get("boutiique_vastraa_customer_token")?.value || null;
    let customerId = null;
    if (customerToken) {
      const customer = jsonDb.getCustomerById(customerToken);
      if (customer) {
        customerId = customer.id;
        
        // Save the address as default if they don't have one
        if (!customer.defaultAddress) {
          customer.defaultAddress = {
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            province: formData.province,
            country: formData.country,
            zip: formData.zip
          };
          customer.phone = formData.phone;
          jsonDb.saveCustomers(jsonDb.getCustomers().map(c => c.id === customer.id ? customer : c));
        }
      }
    }

    // 4. Calculate subtotal & discount
    const subtotal = parseFloat(formattedCart.subtotal);
    let finalAmount = subtotal;
    let discountAmount = 0;

    if (formData.promoCode) {
      const coupon = jsonDb.getCouponByCode(formData.promoCode);
      if (coupon && coupon.active && subtotal >= coupon.minPurchaseAmount) {
        if (coupon.type === "PERCENTAGE") {
          discountAmount = (subtotal * coupon.value) / 100;
        } else {
          discountAmount = coupon.value;
        }
        if (discountAmount > subtotal) discountAmount = subtotal;
        finalAmount = subtotal - discountAmount;
      }
    }

    const orderData = {
      customerId,
      customerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      financialStatus: (formData.paymentMethod === "CARD" ? "PAID" : "PENDING") as any,
      shippingAddress: {
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        zip: formData.zip
      },
      lineItems: formattedCart.lines.map((l: any) => ({
        title: l.title,
        quantity: l.quantity,
        variantId: l.merchandiseId,
        variantTitle: l.variantTitle,
        price: l.price,
        image: l.image
      })),
      totalPrice: {
        amount: finalAmount.toFixed(2),
        currencyCode: "INR"
      },
      discountAmount,
      promoCode: formData.promoCode || null
    };

    const newOrder = jsonDb.createOrder(orderData);

    // Save updated product inventories
    jsonDb.saveProducts(updatedProducts);

    // 5. Delete the cart
    jsonDb.deleteCart(formData.cartId);

    return {
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber
    };
  } catch (error) {
    console.error("Submit Order Error:", error);
    return { success: false, error: "An error occurred while placing your order. Please try again." };
  }
}

export async function trackOrderAction(orderNumber: string, email: string) {
  try {
    const orders = jsonDb.getOrders();
    const cleanNum = orderNumber.replace(/\D/g, "");
    if (!cleanNum) {
      return { success: false, error: "Please enter a valid order number." };
    }
    const parsedNum = parseInt(cleanNum, 10);

    const order = orders.find(
      (o) => o.orderNumber === parsedNum && o.email.toLowerCase() === email.toLowerCase()
    );

    if (!order) {
      return { success: false, error: "No order found with that number and email combination." };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Track Order Action Error:", error);
    return { success: false, error: "Failed to fetch order tracking details." };
  }
}
