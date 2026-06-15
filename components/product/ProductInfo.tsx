"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import VariantSelector from "./VariantSelector";
import ProductActions from "./ProductActions";
import ProductAccordion from "./ProductAccordion";
import { Truck, RefreshCcw, ShieldCheck, MapPin } from "lucide-react";

export default function ProductInfo({ product, recommendedProducts }: { product: any, recommendedProducts?: any[] }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0].node);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");

  const handleOptionChange = (name: string, value: string) => {
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
      <h1 className="text-[22px] md:text-2xl font-medium text-gray-900 mb-2">
        {product.title}
      </h1>
      
      <div className="flex items-center gap-2 mb-1">
        <span className="text-maroonClr font-bold text-xl">
          ₹{price.toFixed(0)}
        </span>
        {hasDiscount && (
          <span className="text-gray-400 line-through text-sm font-medium">
            ₹{compareAtPrice.toFixed(0)}
          </span>
        )}
        {hasDiscount && (
          <span className="bg-[#ffebf0] text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 ml-1">
            {discountPercentage}% OFF
          </span>
        )}
      </div>
      
      <div className="text-gray-500 text-xs mb-3">
        Inclusive of all taxes
      </div>

      <div className="flex items-center gap-1 mb-6">
        <div className="flex text-yellow-400 text-sm">★★★★★</div>
        <a href="#reviews" className="text-gray-500 text-xs hover:underline ml-1">(1) See all reviews</a>
      </div>

      {/* SIMILAR PRODUCTS Section */}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <div className="mb-6 relative border border-maroonClr/30 rounded-md p-3 pt-5">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2">
            <span className="bg-maroonClr text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Similar Products
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto hideScrollbar pb-1">
            {recommendedProducts.map((p) => (
              <Link href={`/products/${p.handle}`} key={p.id} className="flex-shrink-0 w-[72px] h-[90px] relative rounded overflow-hidden border border-gray-200 hover:border-maroonClr transition-colors">
                {p.images.edges[0] && (
                  <Image src={p.images.edges[0].node.url} alt={p.title} fill className="object-cover" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delivery & COD */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 mb-2">
          <MapPin className="w-4 h-4 text-maroonClr" />
          Check Delivery & COD Availability
        </div>
        <div className="flex items-center w-full border border-gray-300 rounded overflow-hidden">
          <input 
            type="text" 
            placeholder="Enter your pincode" 
            className="flex-1 px-3 py-2 text-sm outline-none w-full"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
          <button className="bg-maroonClr text-white px-6 py-2 text-sm font-medium hover:bg-maroonClr/90 transition-colors border-l border-maroonClr">
            Check
          </button>
        </div>
      </div>

      {/* Selectors (only show if it has variants) */}
      {product.options && product.options.some((opt:any) => opt.name !== 'Title') && (
        <div className="mb-6">
          <VariantSelector 
            options={product.options} 
            selectedOptions={selectedVariant.selectedOptions}
            onChange={handleOptionChange}
          />
        </div>
      )}

      <div className="mb-6">
        <ProductActions 
          variantId={selectedVariant.id} 
          quantity={quantity} 
          availableForSale={selectedVariant.availableForSale} 
        />
      </div>

      {/* Features Row */}
      <div className="flex justify-between items-start py-6 border-y border-gray-100 mb-6 gap-2">
        <div className="flex flex-col items-center text-center gap-2 flex-1">
          <Truck className="w-6 h-6 text-[#c49a45]" />
          <span className="text-[11px] font-medium text-maroonClr leading-tight">Shipping all<br/>across India</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 flex-1">
          <RefreshCcw className="w-6 h-6 text-[#c49a45]" />
          <span className="text-[11px] font-medium text-maroonClr leading-tight">Easy 7-Day<br/>Exchange</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 flex-1">
          <ShieldCheck className="w-6 h-6 text-[#c49a45]" />
          <span className="text-[11px] font-medium text-maroonClr leading-tight">Safe Payments<br/>& COD</span>
        </div>
      </div>

      <ProductAccordion descriptionHtml={product.descriptionHtml} />
    </div>
  );
}
