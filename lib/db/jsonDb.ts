import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

// In-memory cache to speed up rendering by avoiding duplicate disk reads
const dbCache: Record<string, any> = {};

// Helper to safely read a JSON file
function readJsonFile<T>(filename: string, defaultValue: T): T {
  if (dbCache[filename] !== undefined) {
    return dbCache[filename] as T;
  }
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      // Ensure directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      dbCache[filename] = defaultValue;
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content) as T;
    dbCache[filename] = parsed;
    return parsed;
  } catch (error) {
    console.error(`Error reading database file ${filename}:`, error);
    dbCache[filename] = defaultValue;
    return defaultValue;
  }
}

// Helper to safely write a JSON file
function writeJsonFile<T>(filename: string, data: T): boolean {
  dbCache[filename] = data; // Sync in-memory cache
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing database file ${filename}:`, error);
    return false;
  }
}

// Hash password utility
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Schemas & Types
export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: {
      node: {
        url: string;
        altText: string;
      };
    }[];
  };
  options: {
    name: string;
    values: string[];
  }[];
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice: {
          amount: string;
          currencyCode: string;
        } | null;
        selectedOptions: {
          name: string;
          value: string;
        }[];
        image?: {
          url: string;
        } | null;
      };
    }[];
  };
  tags: string[];
  collectionHandles: string[];
  inventory: number;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: {
    url: string;
    altText: string;
  } | null;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  defaultAddress?: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  createdAt: string;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  variantId: string;
  variantTitle: string;
  price: string;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerId?: string | null;
  customerName: string;
  email: string;
  phone: string;
  processedAt: string;
  financialStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  fulfillmentStatus: 'UNFULFILLED' | 'FULFILLED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  lineItems: OrderLineItem[];
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandiseId: string; // ProductVariant ID
}

export interface Cart {
  id: string;
  lines: CartLine[];
  createdAt: string;
}

export interface SeoSettings {
  titleTemplate: string;
  defaultDescription: string;
  keywords: string;
}

export interface BannerSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
}

export interface Settings {
  seo: SeoSettings;
  banners: BannerSlide[];
  homepage?: any;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  active: boolean;
  minPurchaseAmount: number;
}

export interface Review {
  id: string;
  productHandle: string;
  author: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

// Database Actions
export const jsonDb = {
  // PRODUCTS
  getProducts(): Product[] {
    return readJsonFile<Product[]>('products.json', []).map(p => {
      // Ensure default inventory
      if (p.inventory === undefined) p.inventory = 10;
      return p;
    });
  },

  saveProducts(products: Product[]): boolean {
    return writeJsonFile<Product[]>('products.json', products);
  },

  getProductByHandle(handle: string): Product | null {
    const products = this.getProducts();
    return products.find(p => p.handle === handle) || null;
  },

  getProductById(id: string): Product | null {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  // COLLECTIONS
  getCollections(): Collection[] {
    return readJsonFile<Collection[]>('collections.json', []);
  },

  saveCollections(collections: Collection[]): boolean {
    return writeJsonFile<Collection[]>('collections.json', collections);
  },

  getCollectionByHandle(handle: string): Collection | null {
    const collections = this.getCollections();
    return collections.find(c => c.handle === handle) || null;
  },

  // CUSTOMERS
  getCustomers(): Customer[] {
    const customers = readJsonFile<Customer[]>('users.json', []);
    const adminEmail = "admin@boutiquevastra.com";
    if (!customers.some(c => c.email.toLowerCase() === adminEmail.toLowerCase())) {
      const defaultAdmin: Customer = {
        id: "customer_admin",
        firstName: "Boutiique",
        lastName: "Admin",
        email: adminEmail,
        passwordHash: hashPassword("admin123"),
        createdAt: new Date().toISOString()
      };
      customers.push(defaultAdmin);
      writeJsonFile<Customer[]>('users.json', customers);
    }
    return customers;
  },

  saveCustomers(customers: Customer[]): boolean {
    return writeJsonFile<Customer[]>('users.json', customers);
  },

  getCustomerById(id: string): Customer | null {
    const customers = this.getCustomers();
    return customers.find(c => c.id === id) || null;
  },

  getCustomerByEmail(email: string): Customer | null {
    const customers = this.getCustomers();
    return customers.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // CARTS
  getCarts(): Record<string, Cart> {
    return readJsonFile<Record<string, Cart>>('carts.json', {});
  },

  saveCarts(carts: Record<string, Cart>): boolean {
    return writeJsonFile<Record<string, Cart>>('carts.json', carts);
  },

  getCart(cartId: string): Cart | null {
    const carts = this.getCarts();
    return carts[cartId] || null;
  },

  createCart(lines: { merchandiseId: string; quantity: number }[]): Cart {
    const carts = this.getCarts();
    const cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCart: Cart = {
      id: cartId,
      lines: lines.map((l, index) => ({
        id: `line_${Date.now()}_${index}`,
        quantity: l.quantity,
        merchandiseId: l.merchandiseId
      })),
      createdAt: new Date().toISOString()
    };
    carts[cartId] = newCart;
    this.saveCarts(carts);
    return newCart;
  },

  addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Cart {
    const carts = this.getCarts();
    let cart = carts[cartId];
    if (!cart) {
      return this.createCart(lines);
    }

    lines.forEach((line) => {
      const existingLine = cart.lines.find(l => l.merchandiseId === line.merchandiseId);
      if (existingLine) {
        existingLine.quantity += line.quantity;
      } else {
        cart.lines.push({
          id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          quantity: line.quantity,
          merchandiseId: line.merchandiseId
        });
      }
    });

    carts[cartId] = cart;
    this.saveCarts(carts);
    return cart;
  },

  updateCartLines(cartId: string, lines: { id: string; quantity: number }[]): Cart {
    const carts = this.getCarts();
    const cart = carts[cartId];
    if (!cart) {
      throw new Error("Cart not found");
    }

    lines.forEach((line) => {
      const existingLine = cart.lines.find(l => l.id === line.id);
      if (existingLine) {
        existingLine.quantity = line.quantity;
      }
    });

    // Filter out lines with 0 or negative quantity
    cart.lines = cart.lines.filter(l => l.quantity > 0);

    carts[cartId] = cart;
    this.saveCarts(carts);
    return cart;
  },

  removeFromCart(cartId: string, lineIds: string[]): Cart {
    const carts = this.getCarts();
    const cart = carts[cartId];
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.lines = cart.lines.filter(l => !lineIds.includes(l.id));

    carts[cartId] = cart;
    this.saveCarts(carts);
    return cart;
  },

  deleteCart(cartId: string): boolean {
    const carts = this.getCarts();
    if (carts[cartId]) {
      delete carts[cartId];
      return this.saveCarts(carts);
    }
    return false;
  },

  // ORDERS
  getOrders(): Order[] {
    return readJsonFile<Order[]>('orders.json', []);
  },

  saveOrders(orders: Order[]): boolean {
    return writeJsonFile<Order[]>('orders.json', orders);
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'processedAt' | 'financialStatus' | 'fulfillmentStatus'>): Order {
    const orders = this.getOrders();
    const orderNumber = orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) + 1 : 1001;
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      orderNumber,
      processedAt: new Date().toISOString(),
      financialStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED'
    };
    orders.push(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: Order['fulfillmentStatus']): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.fulfillmentStatus = status;
      if (status === 'DELIVERED') {
        order.financialStatus = 'PAID';
      }
      this.saveOrders(orders);
      return order;
    }
    return null;
  },

  // ADMIN
  getAdmins(): any[] {
    return readJsonFile<any[]>('admin.json', []);
  },

  verifyAdminCredentials(username: string, passwordHash: string): boolean {
    const admins = this.getAdmins();
    return admins.some(a => a.username === username && a.passwordHash === passwordHash);
  },

  // SETTINGS
  getSettings(): Settings {
    return readJsonFile<Settings>('settings.json', {
      seo: { titleTemplate: '%s | Boutiique Vastraa', defaultDescription: '', keywords: '' },
      banners: []
    });
  },

  saveSettings(settings: Settings): boolean {
    return writeJsonFile<Settings>('settings.json', settings);
  },

  // COUPONS
  getCoupons(): Coupon[] {
    return readJsonFile<Coupon[]>('coupons.json', []);
  },

  saveCoupons(coupons: Coupon[]): boolean {
    return writeJsonFile<Coupon[]>('coupons.json', coupons);
  },

  getCouponByCode(code: string): Coupon | null {
    const coupons = this.getCoupons();
    return coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active) || null;
  },

  // REVIEWS
  getReviews(): Review[] {
    return readJsonFile<Review[]>('reviews.json', []);
  },

  saveReviews(reviews: Review[]): boolean {
    return writeJsonFile<Review[]>('reviews.json', reviews);
  },

  getProductReviews(productHandle: string): Review[] {
    const reviews = this.getReviews();
    return reviews.filter(r => r.productHandle === productHandle && r.approved);
  },

  getGlobalReviews(): Review[] {
    const reviews = this.getReviews();
    return reviews.filter(r => r.productHandle === 'global' && r.approved);
  }
};
