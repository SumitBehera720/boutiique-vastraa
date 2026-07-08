import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import nodePath from "path";
import {
  users, admins, products, collections, coupons, reviews, qna, orders, settings, carts,
  sessions, hashPassword, generateId, getAuthUser, getTokenFromRequest, initDataStore,
} from "@/lib/data-store";

// Initialise database / seed data on first load
let initialized = false;
async function ensureInit() {
  if (initialized) return;
  initialized = true;
  await initDataStore();
}

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function error(msg: string, status = 400) {
  return NextResponse.json({ message: msg }, { status });
}

function parseBody(req: NextRequest): Promise<any> {
  return req.json().catch(() => null);
}

const COOKIE_NAME = "boutiique_vastraa_customer_token";

function setAuthCookie(token: string) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

function clearAuthCookie() {
  return `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax; Secure`;
}

// ─── Auth routes ─────────────────────────────────────────────────────────────

async function handleAuth(path: string[], req: NextRequest) {
  if (path[0] !== "auth") return null;

  const sub = path[1];

  if (sub === "register" && req.method === "POST") {
    const body = await parseBody(req);
    if (!body?.firstName || !body?.lastName || !body?.email || !body?.password)
      return error("All fields required");

    const existing = await users.findByEmail(body.email);
    if (existing) return error("Email already registered", 422);

    const user = {
      id: generateId(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.toLowerCase(),
      passwordHash: hashPassword(body.password),
      createdAt: new Date().toISOString(),
    };
    await users.create(user);
    const token = await sessions.create(user.id);
    return json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } }, 201);
  }

  if (sub === "login" && req.method === "POST") {
    const body = await parseBody(req);
    if (!body?.email || !body?.password) return error("Email and password required");

    let user: any = await users.findByEmail(body.email);
    let isAdmin = false;

    if (!user) {
      const uName = body.email.includes("@") ? body.email.split("@")[0] : body.email;
      const admin = await admins.findByUsername(body.email) || await admins.findByUsername(uName);
      const hash = hashPassword(body.password);
      if (admin && ((admin.passwordHash && admin.passwordHash === hash) || (admin.password && admin.password === hash))) {
        user = {
          id: "admin",
          firstName: "Admin",
          lastName: "",
          email: "admin@boutiquevastra.com",
          defaultAddress: null,
        };
        isAdmin = true;
      }
    } else {
      const hash = hashPassword(body.password);
      if ((user.passwordHash && user.passwordHash !== hash) && (user.password && user.password !== hash)) {
        return error("Invalid credentials", 401);
      }
    }

    if (!user) return error("Invalid credentials", 401);

    const token = isAdmin ? "admin-token" : await sessions.create(user.id);
    if (isAdmin) {
      await sessions.set("admin-token", "admin");
    }

    const res = json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        defaultAddress: user.defaultAddress || null,
      },
    });
    res.headers.set("Set-Cookie", setAuthCookie(token));
    return res;
  }

  if (sub === "logout" && req.method === "POST") {
    const token = getTokenFromRequest(req);
    if (token) await sessions.delete(token);
    const res = json({ success: true });
    res.headers.set("Set-Cookie", clearAuthCookie());
    return res;
  }

  if (sub === "me" && req.method === "GET") {
    const token = getTokenFromRequest(req);
    let user = await getAuthUser(req);
    if (!user && token === "admin-token") {
      user = { id: "admin", firstName: "Admin", lastName: "", email: "admin@boutiquevastra.com", phone: "", defaultAddress: null };
    }
    if (!user) return error("Unauthorized", 401);
    const allOrders = await orders.all();
    const userOrders = allOrders.filter((o: any) => o.email?.toLowerCase() === user.email?.toLowerCase());
    return json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      defaultAddress: user.defaultAddress || null,
      orders: { edges: userOrders.map((o: any) => ({ node: o })) },
    });
  }

  if (path[1] === "me" && path[2] === "address" && req.method === "PUT") {
    const user = await getAuthUser(req);
    if (!user) return error("Unauthorized", 401);
    const body = await parseBody(req);
    if (!body) return error("Invalid request body");
    const address = {
      address1: body.address1 || "",
      address2: body.address2 || "",
      city: body.city || "",
      province: body.province || "",
      zip: body.zip || "",
      country: body.country || "India",
      phone: body.phone || user.phone || "",
    };
    await users.update(user.id, { defaultAddress: address });
    return json({ success: true, defaultAddress: address });
  }

  return error("Not found", 404);
}

// ─── Product routes ──────────────────────────────────────────────────────────

async function handleProducts(path: string[], req: NextRequest) {
  if (path[0] !== "products") return null;

  if (path.length === 1 && req.method === "GET") {
    const url = new URL(req.url);
    const perPage = parseInt(url.searchParams.get("per_page") || "50");
    const all = await products.all();
    return json(all.slice(0, perPage));
  }

  if (path[1] === "search" && req.method === "GET") {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.toLowerCase() || "";
    const all = await products.all();
    return json(all.filter((p: any) => p.title?.toLowerCase().includes(q)));
  }

  if (path.length === 2 && req.method === "GET") {
    const item = await products.findByHandle(path[1]) || await products.findById(path[1]);
    if (!item) return error("Not found", 404);
    return json(item);
  }

  if (path.length === 3 && path[2] === "recommendations" && req.method === "GET") {
    const all = await products.all();
    const filtered = all.filter((p: any) => p.id !== path[1]);
    return json(filtered.slice(0, 8));
  }

  return error("Not found", 404);
}

// ─── Collection routes ────────────────────────────────────────────────────────

async function handleCollections(path: string[], req: NextRequest) {
  if (path[0] !== "collections") return null;

  if (path.length === 1 && req.method === "GET") {
    const url = new URL(req.url);
    const first = parseInt(url.searchParams.get("first") || "20");
    const all = await collections.all();
    return json(all.slice(0, first));
  }

  if (path.length === 2 && req.method === "GET") {
    const handle = path[1];
    const url = new URL(req.url);
    const first = parseInt(url.searchParams.get("first") || "24");
    const all = await products.all();

    // Special "all" collection — returns all products
    if (handle === "all") {
      return json({
        id: "all",
        title: "All Products",
        handle: "all",
        description: "Browse our complete collection of handcrafted ethnic wear.",
        image: null,
        products: { edges: all.slice(0, first).map((p: any) => ({ node: p })) },
      });
    }

    const item = await collections.findByHandle(handle);
    if (!item) return error("Not found", 404);

    const filtered = all.filter((p: any) =>
      p.collectionHandles?.includes(handle)
    );
    return json({
      ...item,
      products: { edges: filtered.slice(0, first).map((p: any) => ({ node: p })) },
    });
  }

  return error("Not found", 404);
}

// ─── Cart routes ──────────────────────────────────────────────────────────────

async function handleCart(path: string[], req: NextRequest) {
  if (path[0] !== "cart") return null;

  if (path.length === 1 && req.method === "POST") {
    const body = await parseBody(req);
    const cartId = generateId();
    const allProducts = await products.all();
    const cart = {
      id: cartId,
      lines: body?.lines?.map((l: any, i: number) => ({
        id: `${cartId}-line-${i}`,
        merchandiseId: l.merchandiseId,
        quantity: l.quantity || 1,
        ...resolveProductInfo(l.merchandiseId, allProducts),
      })) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await carts.save(cartId, cart);
    return json(formatCartCheckout(cart), 201);
  }

  if (path.length === 2 && req.method === "GET") {
    const cart = await carts.get(path[1]);
    if (!cart) return error("Not found", 404);
    return json(formatCartCheckout(cart));
  }

  if (path.length === 3 && path[2] === "lines") {
    const cart = await carts.get(path[1]);
    if (!cart) return error("Not found", 404);

    if (req.method === "POST") {
      const body = await parseBody(req);
      const allProducts = await products.all();
      const newLines = body?.lines?.map((l: any, i: number) => ({
        id: `${cart.id}-line-${Date.now()}-${i}`,
        merchandiseId: l.merchandiseId,
        quantity: l.quantity || 1,
        ...resolveProductInfo(l.merchandiseId, allProducts),
      })) || [];
      cart.lines = [...cart.lines, ...newLines];
      cart.updatedAt = new Date().toISOString();
      await carts.save(path[1], cart);
      return json(formatCartCheckout(cart));
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      if (body?.lines) {
        for (const ln of body.lines) {
          const idx = cart.lines.findIndex((l: any) => l.id === ln.id);
          if (idx >= 0) cart.lines[idx].quantity = ln.quantity;
        }
        cart.updatedAt = new Date().toISOString();
        await carts.save(path[1], cart);
      }
      return json(formatCartCheckout(cart));
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const lineIds = JSON.parse(url.searchParams.get("lineIds") || "[]");
      cart.lines = cart.lines.filter((l: any) => !lineIds.includes(l.id));
      cart.updatedAt = new Date().toISOString();
      await carts.save(path[1], cart);
      return json(formatCartCheckout(cart));
    }
  }

  return error("Not found", 404);
}

function resolveProductInfo(merchandiseId: string, allProducts: any[]) {
  const all = allProducts;
  const prod = all.find((p: any) =>
    p.id === merchandiseId ||
    p.variants?.edges?.some((e: any) => e.node.id === merchandiseId)
  );
  if (!prod) return { title: "Unknown", price: "0", image: null, variantTitle: "Default" };
  const variant = prod.variants?.edges?.[0]?.node;
  return {
    title: prod.title,
    price: variant?.price?.amount || prod.priceRange?.minVariantPrice?.amount || "0",
    image: prod.images?.edges?.[0]?.node?.url || null,
    variantTitle: variant?.title || "Default Title",
  };
}

function formatCartCheckout(cart: any) {
  let subtotal = 0;
  const lines = cart.lines.map((l: any) => {
    const price = parseFloat(l.price || "0");
    subtotal += price * l.quantity;
    return {
      id: l.id,
      title: l.title,
      variantTitle: l.variantTitle,
      quantity: l.quantity,
      price: l.price,
      image: l.image,
    };
  });
  return {
    id: cart.id,
    lines,
    subtotal: subtotal.toFixed(2),
    totalQuantity: lines.reduce((s: number, l: any) => s + l.quantity, 0),
    checkoutUrl: `/checkout?cartId=${cart.id}`,
  };
}

// ─── Order routes ─────────────────────────────────────────────────────────────

async function handleOrders(path: string[], req: NextRequest) {
  if (path[0] !== "orders") return null;

  if (path.length === 1 && req.method === "POST") {
    const body = await parseBody(req);
    if (!body?.cart_id) return error("Cart ID required");

    const cart = await carts.get(body.cart_id);
    if (!cart) return error("Cart not found", 404);

    const orderId = generateId();
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const formatted = formatCartCheckout(cart);

    const order = {
      id: orderId,
      orderNumber,
      customerName: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      shippingAddress: body.shippingAddress || {},
      paymentMethod: body.paymentMethod || "COD",
      lineItems: formatted.lines,
      totalPrice: { amount: (parseFloat(formatted.subtotal) - (body.discount || 0)).toFixed(2), currencyCode: "INR" },
      fulfillmentStatus: "UNFULFILLED",
      financialStatus: "PENDING",
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const all = await orders.all();
    all.push(order);
    await orders.save(all);
    await carts.remove(body.cart_id);

    return json({ id: order.id, orderNumber: order.orderNumber }, 201);
  }

  if (path[1] === "track" && req.method === "GET") {
    const url = new URL(req.url);
    const orderNumber = url.searchParams.get("order_number");
    const email = url.searchParams.get("email");
    if (!orderNumber || !email) return error("Order number and email required");

    const all = await orders.all();
    const order = all.find((o: any) =>
      String(o.orderNumber) === orderNumber && o.email?.toLowerCase() === email.toLowerCase()
    );
    if (!order) return error("Not found", 404);
    return json(order);
  }

  return error("Not found", 404);
}

// ─── Coupon routes ────────────────────────────────────────────────────────────

async function handleCoupons(path: string[], req: NextRequest) {
  if (path[0] !== "coupons") return null;

  if (path[1] === "validate" && req.method === "POST") {
    const body = await parseBody(req);
    if (!body?.code) return error("Code required");

    const coupon = await coupons.findByCode(body.code);
    if (!coupon || !coupon.active) return error("Invalid or expired promo code", 404);

    const subtotal = parseFloat(body.cart_subtotal || "0");
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = subtotal * (parseFloat(coupon.value) / 100);
    } else {
      discountAmount = parseFloat(coupon.value);
    }
    discountAmount = Math.min(discountAmount, subtotal);

    return json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount: Math.round(discountAmount * 100) / 100,
    });
  }

  return error("Not found", 404);
}

// ─── Review routes ────────────────────────────────────────────────────────────

async function handleReviews(path: string[], req: NextRequest) {
  if (path[0] !== "reviews") return null;

  if (path.length === 1 && req.method === "GET") {
    const all = await reviews.all();
    return json(all);
  }

  if (path[1] === "global" && req.method === "GET") {
    const all = await reviews.all();
    const filtered = all.filter((r: any) => r.approved !== false);
    return json(filtered);
  }

  if (path.length === 1 && req.method === "POST") {
    const body = await parseBody(req);
    if (!body?.productId || !body?.author || !body?.comment) return error("Missing fields");

    const review = {
      id: generateId(),
      productId: body.productId,
      author: body.author,
      email: body.email || "",
      rating: body.rating || 5,
      comment: body.comment,
      approved: false,
      createdAt: new Date().toISOString(),
    };
    const all = await reviews.all();
    all.push(review);
    await reviews.save(all);
    return json(review, 201);
  }

  return error("Not found", 404);
}

// ─── Q&A routes ────────────────────────────────────────────────────────────────

async function handleQna(path: string[], req: NextRequest) {
  if (path[0] !== "qna") return null;

  if (path.length === 1 && req.method === "GET") {
    const all = await qna.all();
    return json(all);
  }

  if (path.length === 1 && req.method === "POST") {
    const body = await parseBody(req);
    if (!body?.productHandle || !body?.author || !body?.question) return error("Missing fields");

    const item = {
      id: generateId(),
      productHandle: body.productHandle,
      author: body.author,
      email: body.email || "",
      question: body.question,
      answer: null,
      approved: false,
      createdAt: new Date().toISOString(),
    };
    const all = await qna.all();
    all.push(item);
    await qna.save(all);
    return json(item, 201);
  }

  return error("Not found", 404);
}

// ─── Settings route ────────────────────────────────────────────────────────────

async function handleSettings(path: string[], req: NextRequest) {
  if (path[0] !== "settings") return null;

  if (req.method === "GET") {
    return json(await settings.get() || {});
  }

  return error("Not found", 404);
}

// ─── Admin routes ─────────────────────────────────────────────────────────────

async function handleAdmin(path: string[], req: NextRequest) {
  if (path[0] !== "admin") return null;

  const user = await getAuthUser(req);
  const isAdmin = user?.email === "admin@boutiquevastra.com" || getTokenFromRequest(req) === "admin-token";
  if (!isAdmin) return error("Unauthorized", 401);

  const sub = path[1];

  if (sub === "dashboard" && req.method === "GET") {
    const all = await products.all();
    const colls = await collections.all();
    const ords = await orders.all();
    const custs = await users.all();
    return json({
      totalProducts: all.length,
      totalCollections: colls.length,
      totalOrders: ords.length,
      totalCustomers: custs.length,
      totalRevenue: ords.reduce((s: number, o: any) => s + parseFloat(o.totalPrice?.amount || "0"), 0),
    });
  }

  if (sub === "products") {
    if (req.method === "GET") return json(await products.all());
    if (req.method === "POST" || req.method === "PUT") {
      const body = await parseBody(req);
      const all = await products.all();
      if (body?.id) {
        const idx = all.findIndex((p: any) => p.id === body.id);
        if (idx >= 0) all[idx] = { ...all[idx], ...body };
      } else {
        body.id = generateId();
        if (!body.handle) body.handle = body.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        body.createdAt = new Date().toISOString();
        all.push(body);
      }
      await products.save(all);
      return json({ success: true, id: body.id, handle: body.handle });
    }
    if (req.method === "DELETE") {
      const id = path[2];
      if (!id) return error("Missing id", 400);
      const all = await products.all();
      const filtered = all.filter((p: any) => p.id !== id);
      await products.save(filtered);
      return json({ success: true });
    }
  }

  if (sub === "collections") {
    if (req.method === "GET") return json(await collections.all());
    if (req.method === "POST" || req.method === "PUT") {
      const body = await parseBody(req);
      const all = await collections.all();
      if (body?.id) {
        const idx = all.findIndex((c: any) => c.id === body.id);
        if (idx >= 0) all[idx] = { ...all[idx], ...body };
      } else {
        body.id = generateId();
        if (!body.handle) body.handle = body.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || body.id;
        all.push(body);
      }
      await collections.save(all);
      return json({ success: true, id: body.id, handle: body.handle });
    }
    if (req.method === "DELETE") {
      const id = path[2];
      if (!id) return error("Missing id", 400);
      const all = await collections.all();
      const filtered = all.filter((c: any) => c.id !== id);
      await collections.save(filtered);
      return json({ success: true });
    }
  }

  if (sub === "orders" && req.method === "GET") return json(await orders.all());
  if (sub === "orders" && req.method === "PATCH") {
    const body = await parseBody(req);
    const all = await orders.all();
    const order = all.find((o: any) => o.id === body?.id);
    if (order && body?.fulfillmentStatus) order.fulfillmentStatus = body.fulfillmentStatus;
    await orders.save(all);
    return json({ success: true });
  }

  if (sub === "customers" && req.method === "GET") return json(await users.all());

  if (sub === "coupons") {
    if (req.method === "GET") return json(await coupons.all());
    if (req.method === "POST") {
      const body = await parseBody(req);
      const all = await coupons.all();
      if (body?.id) {
        const idx = all.findIndex((c: any) => c.id === body.id);
        if (idx >= 0) all[idx] = { ...all[idx], ...body };
      } else {
        body.id = generateId();
        all.push(body);
      }
      await coupons.save(all);
      return json({ success: true });
    }
    if (req.method === "PATCH" && path[2] === "toggle") {
      const all = await coupons.all();
      const coupon = all.find((c: any) => c.id === path[3]);
      if (coupon) coupon.active = !coupon.active;
      await coupons.save(all);
      return json({ success: true, active: coupon?.active });
    }
    if (req.method === "DELETE") {
      const id = path[2];
      if (!id) return error("Missing id", 400);
      const all = await coupons.all();
      const filtered = all.filter((c: any) => c.id !== id);
      await coupons.save(filtered);
      return json({ success: true });
    }
  }

  if (sub === "reviews") {
    if (req.method === "GET") return json(await reviews.all());
    if (req.method === "PATCH" && path[2] === "toggle-approval") {
      const all = await reviews.all();
      const review = all.find((r: any) => r.id === path[3]);
      if (review) review.approved = !review.approved;
      await reviews.save(all);
      return json({ success: true });
    }
    if (req.method === "DELETE") {
      const id = path[2];
      if (!id) return error("Missing id", 400);
      const all = await reviews.all();
      const filtered = all.filter((r: any) => r.id !== id);
      await reviews.save(filtered);
      return json({ success: true });
    }
  }

  if (sub === "settings") {
    if (req.method === "GET") return json(await settings.get());
    if (req.method === "POST") {
      const body = await parseBody(req);
      const current = await settings.get();
      const section = path[2];
      if (section && ["seo","banners","homepage","footer","header"].includes(section)) {
        current[section] = body[section] ?? body;
      } else {
        Object.assign(current, body);
      }
      await settings.save(current);
      return json({ success: true });
    }
  }

  if (sub === "upload" && req.method === "POST") {
    const formData = await req.formData();
    const file = formData.get("file") || formData.get("image");
    if (!(file instanceof File)) return error("No file uploaded", 400);
    const ext = file.name.split(".").pop() || "png";
    const fileName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicDir = nodePath.join(process.cwd(), "public", "images");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(nodePath.join(publicDir, fileName), buffer);
    return json({ url: `/images/${fileName}` });
  }

  return error("Not found", 404);
}

// ─── Error-safe wrapper ─────────────────────────────────────────────────────

function safe(fn: (req: NextRequest, params: any) => Promise<Response>) {
  return async (req: NextRequest, context: { params: any }): Promise<Response> => {
    try {
      await ensureInit();
      return await fn(req, context);
    } catch (err: any) {
      console.error(`[API ERROR] ${req.method} ${req.nextUrl.pathname}:`, err);
      return error("Internal server error", 500);
    }
  };
}

// ─── Main router ──────────────────────────────────────────────────────────────

async function routeGET(req: NextRequest, { params }: any) {
  const path = (await params).path || [];
  return (await handleAuth(path, req))
    || (await handleProducts(path, req))
    || (await handleCollections(path, req))
    || (await handleCart(path, req))
    || (await handleOrders(path, req))
    || (await handleCoupons(path, req))
    || (await handleReviews(path, req))
    || (await handleQna(path, req))
    || (await handleSettings(path, req))
    || (await handleAdmin(path, req))
    || error("Not found", 404);
}

async function routePOST(req: NextRequest, { params }: any) {
  const path = (await params).path || [];
  return (await handleAuth(path, req))
    || (await handleCart(path, req))
    || (await handleOrders(path, req))
    || (await handleCoupons(path, req))
    || (await handleReviews(path, req))
    || (await handleQna(path, req))
    || (await handleAdmin(path, req))
    || error("Not found", 404);
}

async function routePUT(req: NextRequest, { params }: any) {
  const path = (await params).path || [];
  return (await handleAuth(path, req))
    || (await handleCart(path, req))
    || (await handleAdmin(path, req))
    || error("Not found", 404);
}

async function routePATCH(req: NextRequest, { params }: any) {
  const path = (await params).path || [];
  return (await handleAdmin(path, req))
    || error("Not found", 404);
}

async function routeDELETE(req: NextRequest, { params }: any) {
  const path = (await params).path || [];
  return (await handleCart(path, req))
    || (await handleAdmin(path, req))
    || error("Not found", 404);
}

export const GET = safe(routeGET);
export const POST = safe(routePOST);
export const PUT = safe(routePUT);
export const PATCH = safe(routePATCH);
export const DELETE = safe(routeDELETE);
