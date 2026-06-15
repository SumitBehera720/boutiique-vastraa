"use client";

import { useState, useEffect } from "react";
import VariantSelector from "./VariantSelector";
import QuantitySelector from "./QuantitySelector";
import ProductActions from "./ProductActions";
import ProductAccordion from "./ProductAccordion";

export default function ProductInfo({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0].node);
  const [quantity, setQuantity] = useState(1);

  // Sync selected options from state
  const handleOptionChange = (name: string, value: string) => {
    // Find the variant that matches all current selected options + the new one
    const newOptions = selectedVariant.selectedOptions.map((opt: any) => 
      opt.name === name ? { ...opt, value } : opt
    );

    const variant = product.variants.edges.find((edge: any) => {
      return newOptions.every((newOpt: any) => 
        edge.node.selectedOptions.find((o: any) => o.name === newOpt.name && o.value === newOpt.value)
      );
    });

    if (variant) {
      setSelectedVariant(variant.node);
    }
  };

  const price = parseFloat(selectedVariant.price.amount);
  const compareAtPrice = selectedVariant.compareAtPrice?.amount 
    ? parseFloat(selectedVariant.compareAtPrice.amount) 
    : null;
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl md:text-4xl font-serif text-gray-900 font-bold mb-2">
        {product.title}
      </h1>
      
      <div className="flex gap-1 text-secondary mb-4 text-sm">
        ★★★★★ <span className="text-gray-400 text-xs ml-1">(5 Reviews)</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-primary font-bold text-2xl">
          ₹{price.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-gray-400 line-through text-lg">
            ₹{compareAtPrice.toFixed(2)}
          </span>
        )}
        {hasDiscount && (
          <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
            Save {discountPercentage}%
          </span>
        )}
      </div>

      {!selectedVariant.availableForSale && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded mb-6 font-medium text-sm inline-block">
          Out of Stock
        </div>
      )}

      {/* HTML Description */}
      <div 
        className="prose prose-sm text-gray-600 mb-8"
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      />

      <hr className="border-gray-200 mb-6" />

      {/* Selectors */}
      <VariantSelector 
        options={product.options} 
        selectedOptions={selectedVariant.selectedOptions}
        onChange={handleOptionChange}
      />

      <div className="flex items-end gap-4 mb-8">
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        <div className="flex-1">
          <ProductActions 
            variantId={selectedVariant.id} 
            quantity={quantity} 
            availableForSale={selectedVariant.availableForSale} 
          />
        </div>
      </div>

      <ProductAccordion descriptionHtml={product.descriptionHtml} />
    </div>
  );
}
