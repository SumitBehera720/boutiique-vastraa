# Boutiique Vastraa - Next.js 15 E-Commerce Migration
## Final Client Delivery & Deployment Guide

This document outlines the final project architecture, environment configuration, and instructions for deploying the Boutiique Vastraa Next.js 15 frontend to production.

---

### 1. Project Structure
The application has been completely refactored from a static Vite app into a highly scalable Next.js 15 App Router architecture.

```text
BOUTIIQUE VASTRAA/
├── app/                      # Next.js App Router root
│   ├── account/              # Customer Dashboard & Auth
│   ├── actions/              # Secure Server Actions (Auth, Cart sync)
│   ├── collections/          # Dynamic Collection pages with filters
│   ├── products/             # Dynamic Product Details pages
│   ├── search/               # Global search logic
│   ├── wishlist/             # Wishlist dashboard
│   ├── layout.tsx            # Root layout (Header, Footer, Cart Drawer)
│   └── page.tsx              # Dynamic Homepage
├── components/               # React components library
│   ├── global/               # Header, Footer, AnnouncementBar
│   ├── home/                 # HeroBanner, Sliders, Promos
│   ├── product/              # ProductCards, VariantSelectors
│   └── account/              # Auth forms, OrderHistory
├── lib/shopify/              # Shopify GraphQL Integration
│   ├── client.ts             # Base fetch utility
│   ├── queries.ts            # Products, Collections, Search Queries
│   └── mutations.ts          # Cart and Customer Auth Mutations
├── store/                    # Zustand persistent state management
│   ├── cartStore.ts          
│   └── wishlistStore.ts      
└── public/                   # Static assets & Manifest
```

---

### 2. Environment Setup Guide
To run the project locally or in production, ensure the following environment variables are strictly defined. **Never commit these to version control.**

Create a `.env.local` file at the root:
```env
# Shopify Storefront credentials
SHOPIFY_STORE_DOMAIN=https://your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=your_storefront_access_token

# Application Base URL (for SEO & Sitemaps)
NEXT_PUBLIC_SITE_URL=https://boutiquevastra.com
```

---

### 3. Deployment Steps (Vercel Recommended)
Since this is a Next.js 15 application leveraging React Server Components and Server Actions, **Vercel** is the officially recommended and highest-performing deployment target.

1. **Push your code to GitHub/GitLab.**
2. **Log into Vercel** and select "Add New Project".
3. **Import the repository.**
4. In the **Environment Variables** section, add `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_ACCESS_TOKEN`.
5. Ensure the framework preset is set to **Next.js**.
6. Click **Deploy**.

> **Note:** The application uses Shopify fetch caching natively. Subsequent hits to the homepage or collections will be lightning fast.

---

### 4. Shopify Configuration Guide
To ensure the frontend functions seamlessly, verify the following in your Shopify Admin:

1. **Storefront API App**: Ensure you have created a Headless app in Shopify Admin -> Settings -> Apps and sales channels -> Develop apps. The app requires the `unauthenticated_read_products`, `unauthenticated_read_product_listings`, `unauthenticated_write_customers`, and `unauthenticated_read_customers` scopes.
2. **Tags & Handles**: Ensure your Shopify collections and products have clean URL handles (e.g., `saree`, `kurtis`). 
3. **Inventory Management**: Ensure products have images, prices, and variant options configured. The Next.js frontend will automatically extract "Size", "Color", or "Fabric" options if they exist.

---

### 5. Maintenance Notes
- **Updating the UI**: All styling uses standard Tailwind CSS classes. Global colors like `#800020` (Primary) and `#D4AF37` (Secondary/Gold) are configured in `tailwind.config.mjs`.
- **Search Engine Optimization (SEO)**: `app/sitemap.ts` and `app/robots.ts` are dynamically generated. JSON-LD structured data is natively injected into `/products/[handle]`.
- **State Persistence**: The Shopping Cart and Wishlist states are persisted across browser sessions utilizing `zustand/middleware` and `localStorage`.

---
*Developed with Next.js 15, Tailwind CSS, Framer Motion, and the Shopify Storefront API.*
