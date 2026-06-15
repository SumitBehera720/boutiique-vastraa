"use client";

import ProductCard from "@/components/product/ProductCard";

export default function ProductGrid({ products }: { products: any[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center bg-white rounded border border-gray-100">
        <h3 className="text-xl font-serif text-gray-800 mb-2">No products found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((edge: any) => (
        <ProductCard key={edge.node.id} product={edge.node} />
      ))}
    </div>
  );
}
