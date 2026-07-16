import fs from "fs";
import path from "path";
import crypto from "crypto";

// Try to load env files when running in standalone mode
// The standalone server runs from .next/standalone/ so .env.local is not auto-loaded
(function loadEnvFiles() {
  const envPaths = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "..", ".env.local"),
    path.join(process.cwd(), "..", ".env"),
    path.join(process.cwd(), "..", "..", ".env.local"),
    path.join(process.cwd(), "..", "..", ".env"),
  ];
  for (const envPath of envPaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx === -1) continue;
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch {}
  }
})();

const DB_HOST = process.env.DB_HOST || "";
const DB_USER = process.env.DB_USER || "";
const DB_PASS = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "";
const USE_DB = process.env.ENABLE_DATABASE === 'true';

let mysql: any = null;

async function getMysql() {
  if (!mysql) {
    mysql = await import("mysql2/promise").catch(() => null);
  }
  return mysql;
}

let pool: any = null;

async function getPool() {
  if (!pool) {
    const m = await getMysql();
    if (!m) throw new Error("mysql2 not available");
    pool = m.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  if (!USE_DB) return [] as any;
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return rows as T;
}

export async function getOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  if (!USE_DB) return null;
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return (rows.length ? rows[0] : null) as T | null;
}

function safeValue(val: any): any {
  if (val !== null && typeof val === "object" && !(val instanceof Date)) {
    return JSON.stringify(val);
  }
  return val;
}

export async function insert(table: string, data: Record<string, any>): Promise<void> {
  if (!USE_DB) return;
  const keys = Object.keys(data);
  const vals = Object.values(data).map(safeValue);
  const placeholders = keys.map(() => "?").join(", ");
  await query(`INSERT INTO ?? (${keys.map(() => "??").join(", ")}) VALUES (${placeholders})`, [table, ...keys, ...vals]);
}

export async function update(table: string, idCol: string, idVal: any, data: Record<string, any>): Promise<void> {
  if (!USE_DB) return;
  const keys = Object.keys(data);
  const vals = Object.values(data).map(safeValue);
  const sets = keys.map(() => "?? = ?").join(", ");
  const flat: any[] = [];
  for (let i = 0; i < keys.length; i++) { flat.push(keys[i], vals[i]); }
  flat.push(idVal);
  await query(`UPDATE ?? SET ${sets} WHERE ${idCol} = ?`, [table, ...flat]);
}

export async function upsert(table: string, idCol: string, data: Record<string, any>): Promise<void> {
  if (!USE_DB) return;
  const idVal = data[idCol];
  if (!idVal) return;
  const existing = idCol === "token"
    ? await getOne(`SELECT 1 FROM ?? WHERE token = ?`, [table, idVal])
    : await getOne(`SELECT 1 FROM ?? WHERE ${idCol} = ?`, [table, idVal]);
  if (existing) {
    const { [idCol]: _, ...rest } = data;
    await update(table, idCol, idVal, rest);
  } else {
    await insert(table, data);
  }
}

export async function remove(table: string, idCol: string, idVal: any): Promise<void> {
  if (!USE_DB) return;
  await query(`DELETE FROM ?? WHERE ${idCol} = ?`, [table, idVal]);
}

export async function replaceAll(table: string, items: Record<string, any>[], idCol = "id"): Promise<void> {
  if (!USE_DB || !items.length) return;
  const p = await getPool();
  const conn = await p.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM ??`, [table]);
    for (const item of items) {
      const keys = Object.keys(item);
      const vals = Object.values(item).map(safeValue);
      const ph = keys.map(() => "?").join(", ");
      await conn.query(`INSERT INTO ?? (${keys.map(() => "??").join(", ")}) VALUES (${ph})`, [table, ...keys, ...vals]);
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export const dbAvailable = () => USE_DB;

// ─── Table creation ──────────────────────────────────────────────────────────

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  \`data\` JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  \`handle\` VARCHAR(500) NOT NULL,
  description TEXT,
  available_for_sale BOOLEAN DEFAULT true,
  price_range JSON,
  compare_at_price_range JSON,
  images JSON,
  variants JSON,
  tags JSON,
  collection_handles JSON,
  show_size_chart BOOLEAN DEFAULT true,
  size_chart_image VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_handle (\`handle\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collections (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  \`handle\` VARCHAR(500) NOT NULL,
  description TEXT,
  \`image\` JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_handle (\`handle\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(100) NOT NULL,
  \`type\` VARCHAR(50),
  \`value\` DECIMAL(12,2),
  min_purchase DECIMAL(12,2),
  max_uses INT DEFAULT 0,
  used_count INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  product_handle VARCHAR(500),
  author VARCHAR(255),
  rating INT DEFAULT 5,
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  order_number VARCHAR(100),
  email VARCHAR(255),
  customer JSON,
  items JSON,
  shipping_address JSON,
  total_price JSON,
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  \`password\` VARCHAR(255),
  default_address JSON,
  cart_id VARCHAR(255) DEFAULT NULL,
  wishlist JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  \`password\` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carts (
  cart_id VARCHAR(255) PRIMARY KEY,
  \`data\` JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS qna (
  id VARCHAR(255) PRIMARY KEY,
  product_handle VARCHAR(500),
  author VARCHAR(255),
  email VARCHAR(255),
  question TEXT,
  answer TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prod (product_handle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export async function initDatabase(): Promise<void> {
  if (!USE_DB) return;
  try {
    // create database if not exists - ignore error if it fails (common on shared hosting)
    try {
      const m = await getMysql();
      if (m) {
        const tmpPool = m.createPool({ host: DB_HOST, user: DB_USER, password: DB_PASS, connectionLimit: 1 });
        await tmpPool.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await tmpPool.end();
      }
    } catch (dbErr) {
      console.log("[DB] CREATE DATABASE omitted or failed (usual on shared hosting):", dbErr);
    }

    const stmts = SCHEMA_SQL.split(";").map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      await query(stmt + ";");
    }

    // Safely add collection_handles column if it does not exist
    try {
      await query("ALTER TABLE products ADD COLUMN collection_handles JSON AFTER tags;");
      console.log("[DB] Added collection_handles column to products table");
    } catch (colErr) {
      // Column probably already exists, which is fine
    }

    try {
      await query("ALTER TABLE products ADD COLUMN show_size_chart BOOLEAN DEFAULT true AFTER collection_handles;");
    } catch {}

    try {
      await query("ALTER TABLE products ADD COLUMN size_chart_image VARCHAR(500) DEFAULT NULL AFTER show_size_chart;");
    } catch {}

    try {
      await query("ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER collection_handles;");
    } catch {}

    try {
      await query("ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;");
    } catch {}

    try {
      await query("ALTER TABLE users ADD COLUMN cart_id VARCHAR(255) DEFAULT NULL AFTER default_address;");
    } catch {}

    try {
      await query("ALTER TABLE users ADD COLUMN wishlist JSON DEFAULT NULL AFTER cart_id;");
    } catch {}

    console.log("[DB] Tables ready");
  } catch (err) {
    console.error("[DB] Init error:", err);
    throw err;
  }
}

// ─── Data seeding from JSON files ───────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(name: string): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf-8"));
  } catch {
    return ([] as any) as T;
  }
}

async function countRows(table: string): Promise<number> {
  const row = await getOne<any>(`SELECT COUNT(*) AS cnt FROM ??`, [table]);
  return row?.cnt ?? 0;
}

export async function seedIfEmpty(): Promise<void> {
  if (!USE_DB) return;

  const settingsCount = await countRows("settings");
  if (settingsCount === 0) {
    const data = readJson<any>("settings");
    if (data && Object.keys(data).length) {
      await upsert("settings", "id", { id: 1, data });
    }
  }

  const productCount = await countRows("products");
  if (productCount === 0) {
    const items = readJson<any[]>("products");
    if (items.length) {
      const mapped = items.map((p: any) => ({
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
      }));
      await replaceAll("products", mapped);
    }
  }

  const collectionCount = await countRows("collections");
  if (collectionCount === 0) {
    const items = readJson<any[]>("collections");
    if (items.length) {
      const mapped = items.map((c: any) => ({
        id: c.id,
        title: c.title,
        handle: c.handle || c.id,
        description: c.description || "",
        image: JSON.stringify(c.image || c.bannerImage || null),
      }));
      await replaceAll("collections", mapped);
    }
  }

  const couponCount = await countRows("coupons");
  if (couponCount === 0) {
    const items = readJson<any[]>("coupons");
    if (items.length) {
      const mapped = items.map((c: any) => ({
        id: c.id,
        code: c.code,
        type: c.type || "percentage",
        value: c.value || 0,
        min_purchase: c.minPurchase || 0,
        max_uses: c.maxUses || 0,
        used_count: c.usedCount || 0,
        active: c.active ?? true,
        expires_at: c.expiresAt || null,
      }));
      await replaceAll("coupons", mapped);
    }
  }

  const reviewCount = await countRows("reviews");
  if (reviewCount === 0) {
    const items = readJson<any[]>("reviews");
    if (items.length) {
      const mapped = items.map((r: any) => ({
        id: r.id,
        product_handle: r.productHandle || "global",
        author: r.author,
        rating: r.rating || 5,
        comment: r.comment,
        approved: r.approved ?? true,
      }));
      await replaceAll("reviews", mapped);
    }
  }

  const userCount = await countRows("users");
  if (userCount === 0) {
    const items = readJson<any[]>("users");
    if (items.length) {
      const mapped = items.map((u: any) => ({
        id: u.id,
        first_name: u.firstName || "",
        last_name: u.lastName || "",
        email: u.email,
        phone: u.phone || "",
        password: u.password || "",
        default_address: JSON.stringify(u.defaultAddress || null),
      }));
      await replaceAll("users", mapped);
    }
  }

  const adminCount = await countRows("admin");
  if (adminCount === 0) {
    const items = readJson<any[]>("admin");
    if (items.length) {
      const mapped = items.map((a: any) => ({
        id: a.id || a.username || "admin",
        username: a.username,
        password: a.password || a.passwordHash || "",
      }));
      await replaceAll("admin", mapped);
    }
  }

  const orderCount = await countRows("orders");
  if (orderCount === 0) {
    const items = readJson<any[]>("orders");
    if (items.length) {
      const mapped = items.map((o: any) => ({
        id: o.id,
        order_number: o.orderNumber || "",
        email: o.email || "",
        customer: JSON.stringify(o.customer || {}),
        items: JSON.stringify(o.items || []),
        shipping_address: JSON.stringify(o.shippingAddress || {}),
        total_price: JSON.stringify(o.totalPrice || { amount: "0", currencyCode: "INR" }),
        fulfillment_status: o.fulfillmentStatus || "unfulfilled",
        payment_status: o.paymentStatus || "pending",
      }));
      await replaceAll("orders", mapped);
    }
  }

  const qnaCount = await countRows("qna");
  if (qnaCount === 0) {
    const items = readJson<any[]>("qna");
    if (items.length) {
      const mapped = items.map((q: any) => ({
        id: q.id,
        product_handle: q.productHandle || "global",
        author: q.author,
        email: q.email || "",
        question: q.question,
        answer: q.answer || null,
        approved: q.approved ?? false,
      }));
      await replaceAll("qna", mapped);
    }
  }

  console.log("[DB] Seed complete");
}

// ─── Housekeeping ───────────────────────────────────────────────────────────

export async function runDbHousekeeping(): Promise<void> {
  if (!USE_DB) return;
  try {
    // purge carts older than 24 hours
    await query(`DELETE FROM carts WHERE updated_at < NOW() - INTERVAL 1 DAY`);
    // purge orphan sessions
    await query(`DELETE s FROM sessions s LEFT JOIN users u ON s.user_id = u.id WHERE u.id IS NULL`);
  } catch {
    // never crash
  }
}
