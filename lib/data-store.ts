import fs from "fs";
import path from "path";
import crypto from "crypto";
import { dbAvailable, query, getOne, insert, update, upsert, remove, replaceAll, initDatabase, seedIfEmpty, runDbHousekeeping } from "./db";

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_TTL = 1500;
const USE_DB = dbAvailable();
let DB_READY = false;

function db() { return DB_READY && USE_DB; }

// ─── Simple TTL cache (only used in JSON mode) ─────────────────────────────
const cache = new Map<string, { data: any; expiresAt: number }>();

function cachedRead<T>(name: string, ttl = CACHE_TTL): T {
  const key = name;
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expiresAt > now) return entry.data as T;
  const data = readRaw<T>(name);
  cache.set(key, { data, expiresAt: now + ttl });
  if (cache.size > 50) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  return data;
}

function filePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

function readRaw<T>(name: string): T {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), "utf-8"));
  } catch {
    return ([] as any) as T;
  }
}

function writeJson<T>(name: string, data: T): void {
  const fp = filePath(name);
  const tmp = fp + ".tmp." + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, fp);
  cache.delete(name);
}

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = {
  all: async () => {
    if (db()) {
      const rows = await query<any[]>("SELECT * FROM users");
      return rows.map(mapUserFromDb);
    }
    return cachedRead<any[]>("users");
  },
  findByEmail: async (email: string) => {
    if (db()) {
      const row = await getOne<any>("SELECT * FROM users WHERE email = ?", [email]);
      return row ? mapUserFromDb(row) : null;
    }
    return cachedRead<any[]>("users").find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  findById: async (id: string) => {
    if (db()) {
      const row = await getOne<any>("SELECT * FROM users WHERE id = ?", [id]);
      return row ? mapUserFromDb(row) : null;
    }
    return cachedRead<any[]>("users").find((u: any) => u.id === id) || null;
  },
  create: async (user: any) => {
    if (db()) {
      await insert("users", {
        id: user.id, first_name: user.firstName || "", last_name: user.lastName || "",
        email: user.email, phone: user.phone || "", password: user.password || "",
        default_address: JSON.stringify(user.defaultAddress || null),
      });
      return user;
    }
    const all = cachedRead<any[]>("users");
    all.push(user);
    writeJson("users", all);
    return user;
  },
};

function mapUserFromDb(row: any): any {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone || "",
    password: row.password,
    defaultAddress: row.default_address ? (typeof row.default_address === "string" ? JSON.parse(row.default_address) : row.default_address) : null,
  };
}

// ─── Admins ─────────────────────────────────────────────────────────────────

export const admins = {
  all: async () => {
    if (db()) {
      return await query<any[]>("SELECT * FROM admin");
    }
    return cachedRead<any[]>("admin");
  },
  findByUsername: async (username: string) => {
    if (db()) {
      return await getOne<any>("SELECT * FROM admin WHERE username = ?", [username]);
    }
    return cachedRead<any[]>("admin").find((a: any) => a.username === username) || null;
  },
};

// ─── Products ───────────────────────────────────────────────────────────────

export const products = {
  all: async () => {
    if (db()) {
      const rows = await query<any[]>("SELECT * FROM products ORDER BY created_at DESC");
      return rows.map(mapProductFromDb);
    }
    return cachedRead<any[]>("products");
  },
  findByHandle: async (handle: string) => {
    if (db()) {
      const row = await getOne<any>("SELECT * FROM products WHERE handle = ?", [handle]);
      return row ? mapProductFromDb(row) : null;
    }
    return cachedRead<any[]>("products").find((p: any) => p.handle === handle) || null;
  },
  findById: async (id: string) => {
    if (db()) {
      const row = await getOne<any>("SELECT * FROM products WHERE id = ?", [id]);
      return row ? mapProductFromDb(row) : null;
    }
    return cachedRead<any[]>("products").find((p: any) => p.id === id) || null;
  },
  save: async (items: any[]) => {
    if (db()) {
      const mapped = items.map(mapProductToDb);
      await replaceAll("products", mapped);
      return;
    }
    writeJson("products", items);
  },
};

function mapProductFromDb(row: any): any {
  const parse = (v: any) => (v ? (typeof v === "string" ? JSON.parse(v) : v) : {});
  return {
    id: row.id,
    title: row.title,
    handle: row.handle,
    description: row.description || "",
    availableForSale: !!row.available_for_sale,
    priceRange: parse(row.price_range),
    compareAtPriceRange: parse(row.compare_at_price_range),
    images: parse(row.images),
    variants: parse(row.variants),
    tags: parse(row.tags),
    collectionHandles: parse(row.collection_handles) || [],
  };
}

function mapProductToDb(p: any): any {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle || p.id,
    description: p.description || "",
    available_for_sale: p.availableForSale ?? true,
    price_range: JSON.stringify(p.priceRange || {}),
    compare_at_price_range: JSON.stringify(p.compareAtPriceRange || {}),
    images: JSON.stringify(p.images || { edges: [] }),
    variants: JSON.stringify(p.variants || { edges: [] }),
    tags: JSON.stringify(p.tags || []),
    collection_handles: JSON.stringify(p.collectionHandles || []),
  };
}

// ─── Collections ────────────────────────────────────────────────────────────

export const collections = {
  all: async () => {
    if (db()) {
      const rows = await query<any[]>("SELECT * FROM collections ORDER BY created_at DESC");
      return rows.map(mapCollectionFromDb);
    }
    return cachedRead<any[]>("collections");
  },
  findByHandle: async (handle: string) => {
    if (db()) {
      const row = await getOne<any>("SELECT * FROM collections WHERE handle = ?", [handle]);
      return row ? mapCollectionFromDb(row) : null;
    }
    return cachedRead<any[]>("collections").find((c: any) => c.handle === handle) || null;
  },
  save: async (items: any[]) => {
    if (db()) {
      const mapped = items.map(mapCollectionToDb);
      await replaceAll("collections", mapped);
      return;
    }
    writeJson("collections", items);
  },
};

function mapCollectionFromDb(row: any): any {
  return {
    id: row.id,
    title: row.title,
    handle: row.handle,
    description: row.description || "",
    image: row.image ? (typeof row.image === "string" ? JSON.parse(row.image) : row.image) : null,
  };
}

function mapCollectionToDb(c: any): any {
  return {
    id: c.id,
    title: c.title,
    handle: c.handle || c.id,
    description: c.description || "",
    image: JSON.stringify(c.image || c.bannerImage || null),
  };
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export const coupons = {
  all: async () => {
    if (db()) {
      const rows = await query<any[]>("SELECT * FROM coupons ORDER BY created_at DESC");
      return rows.map(mapCouponFromDb);
    }
    return cachedRead<any[]>("coupons");
  },
  findByCode: async (code: string) => {
    if (db()) {
      const row = await getOne<any>("SELECT * FROM coupons WHERE code = ?", [code]);
      return row ? mapCouponFromDb(row) : null;
    }
    return cachedRead<any[]>("coupons").find((c: any) => c.code?.toLowerCase() === code.toLowerCase()) || null;
  },
  save: async (items: any[]) => {
    if (db()) {
      const mapped = items.map(mapCouponToDb);
      await replaceAll("coupons", mapped);
      return;
    }
    writeJson("coupons", items);
  },
};

function mapCouponFromDb(row: any): any {
  return {
    id: row.id,
    code: row.code,
    type: row.type || "percentage",
    value: Number(row.value) || 0,
    minPurchase: Number(row.min_purchase) || 0,
    maxUses: row.max_uses || 0,
    usedCount: row.used_count || 0,
    active: !!row.active,
    expiresAt: row.expires_at,
  };
}

function mapCouponToDb(c: any): any {
  return {
    id: c.id,
    code: c.code,
    type: c.type || "percentage",
    value: c.value || 0,
    min_purchase: c.minPurchase || 0,
    max_uses: c.maxUses || 0,
    used_count: c.usedCount || 0,
    active: c.active ?? true,
    expires_at: c.expiresAt || null,
  };
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export const reviews = {
  all: async () => {
    if (db()) {
      const rows = await query<any[]>("SELECT * FROM reviews ORDER BY created_at DESC");
      return rows.map(mapReviewFromDb);
    }
    return cachedRead<any[]>("reviews");
  },
  save: async (items: any[]) => {
    if (db()) {
      const mapped = items.map(mapReviewToDb);
      await replaceAll("reviews", mapped);
      return;
    }
    writeJson("reviews", items);
  },
};

function mapReviewFromDb(row: any): any {
  return {
    id: row.id,
    productHandle: row.product_handle || "global",
    author: row.author,
    rating: row.rating || 5,
    comment: row.comment,
    approved: !!row.approved,
    createdAt: row.created_at,
  };
}

function mapReviewToDb(r: any): any {
  return {
    id: r.id,
    product_handle: r.productHandle || "global",
    author: r.author,
    rating: r.rating || 5,
    comment: r.comment,
    approved: r.approved ?? true,
  };
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export const orders = {
  all: async () => {
    if (db()) {
      const rows = await query<any[]>("SELECT * FROM orders ORDER BY created_at DESC");
      return rows.map(mapOrderFromDb);
    }
    return cachedRead<any[]>("orders");
  },
  save: async (items: any[]) => {
    if (db()) {
      const mapped = items.map(mapOrderToDb);
      await replaceAll("orders", mapped);
      return;
    }
    writeJson("orders", items);
  },
};

function mapOrderFromDb(row: any): any {
  const parse = (v: any) => (v ? (typeof v === "string" ? JSON.parse(v) : v) : {});
  return {
    id: row.id,
    orderNumber: row.order_number,
    email: row.email,
    customer: parse(row.customer),
    items: parse(row.items),
    shippingAddress: parse(row.shipping_address),
    totalPrice: parse(row.total_price),
    fulfillmentStatus: row.fulfillment_status || "unfulfilled",
    paymentStatus: row.payment_status || "pending",
    createdAt: row.created_at,
  };
}

function mapOrderToDb(o: any): any {
  return {
    id: o.id,
    order_number: o.orderNumber || "",
    email: o.email || "",
    customer: JSON.stringify(o.customer || {}),
    items: JSON.stringify(o.items || []),
    shipping_address: JSON.stringify(o.shippingAddress || {}),
    total_price: JSON.stringify(o.totalPrice || { amount: "0", currencyCode: "INR" }),
    fulfillment_status: o.fulfillmentStatus || "unfulfilled",
    payment_status: o.paymentStatus || "pending",
  };
}

// ─── Settings ───────────────────────────────────────────────────────────────

export const settings = {
  get: async () => {
    if (db()) {
      const row = await getOne<any>("SELECT data FROM settings WHERE id = 1");
      if (row) return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      return {};
    }
    return cachedRead<any>("settings");
  },
  save: async (data: any) => {
    if (db()) {
      await upsert("settings", "id", { id: 1, data: JSON.stringify(data) });
      return;
    }
    writeJson("settings", data);
  },
};

// ─── Carts ──────────────────────────────────────────────────────────────────

export const carts = {
  get: async (id: string) => {
    if (db()) {
      const row = await getOne<any>("SELECT data FROM carts WHERE cart_id = ?", [id]);
      if (row) return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      return null;
    }
    const all = cachedRead<Record<string, any>>("carts");
    return all[id] || null;
  },
  save: async (id: string, data: any) => {
    if (db()) {
      await upsert("carts", "cart_id", { cart_id: id, data: JSON.stringify(data) });
      return;
    }
    const all = cachedRead<Record<string, any>>("carts");
    all[id] = data;
    writeJson("carts", all);
  },
  remove: async (id: string) => {
    if (db()) {
      await remove("carts", "cart_id", id);
      return;
    }
    const all = cachedRead<Record<string, any>>("carts");
    delete all[id];
    writeJson("carts", all);
  },
};

// ─── Sessions ───────────────────────────────────────────────────────────────

const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function readSessionsRaw(): Record<string, string> {
  try { return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8")); }
  catch { return {}; }
}

function writeSessionsRaw(s: Record<string, string>) {
  const tmp = SESSIONS_FILE + ".tmp." + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2), "utf-8");
  fs.renameSync(tmp, SESSIONS_FILE);
}

export const sessions = {
  create: async (userId: string): Promise<string> => {
    const token = crypto.randomBytes(32).toString("hex");
    if (db()) {
      await insert("sessions", { token, user_id: userId });
      return token;
    }
    const all = readSessionsRaw();
    all[token] = userId;
    writeSessionsRaw(all);
    return token;
  },
  getUserId: async (token: string): Promise<string | null> => {
    if (db()) {
      const row = await getOne<any>("SELECT user_id FROM sessions WHERE token = ?", [token]);
      return row?.user_id || null;
    }
    const all = readSessionsRaw();
    return all[token] || null;
  },
  delete: async (token: string) => {
    if (db()) {
      await remove("sessions", "token", token);
      return;
    }
    const all = readSessionsRaw();
    delete all[token];
    writeSessionsRaw(all);
  },
};

// ─── Auth helpers ───────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const COOKIE_NAME = "boutiique_vastraa_customer_token";

export function getTokenFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("_token");
  if (queryToken) return queryToken;
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getAuthUser(request: Request): Promise<any> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const userId = await sessions.getUserId(token);
  if (!userId) return null;
  return users.findById(userId);
}

export function generateId(): string {
  return `id_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

// ─── Init & housekeeping ────────────────────────────────────────────────────

export async function initDataStore(): Promise<void> {
  if (USE_DB) {
    try {
      await initDatabase();
      await seedIfEmpty();
      await runDbHousekeeping();
      DB_READY = true;
      console.log("[DataStore] MySQL ready");
    } catch (err) {
      console.error("[DataStore] MySQL init failed, falling back to JSON files:", err);
    }
  }
  if (!db()) {
    runJsonHousekeeping();
    setInterval(runJsonHousekeeping, 60 * 60 * 1000);
  }
}

function runJsonHousekeeping(): void {
  try {
    const allCarts = cachedRead<Record<string, any>>("carts");
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    let changed = false;
    for (const [id, cart] of Object.entries(allCarts)) {
      const t = new Date(cart.createdAt || cart.updatedAt || 0).getTime();
      if (now - t > DAY) { delete allCarts[id]; changed = true; }
    }
    if (changed) writeJson("carts", allCarts);

    const allSessions = readSessionsRaw();
    let sessChanged = false;
    for (const [token, uid] of Object.entries(allSessions)) {
      const userArr = cachedRead<any[]>("users");
      if (!userArr.find((u: any) => u.id === uid)) {
        delete allSessions[token];
        sessChanged = true;
      }
    }
    if (sessChanged) writeSessionsRaw(allSessions);
  } catch {}
}
