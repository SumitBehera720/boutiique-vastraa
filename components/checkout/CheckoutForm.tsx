"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCartForCheckout, submitOrder } from "@/lib/api/checkout-client";
import { applyPromoCode } from "@/lib/api/promo-client";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeft, CreditCard, Shield, Truck, AlertCircle, Sparkles, Tag, X } from "lucide-react";
import Link from "next/link";
import { getTokenFromCookie } from "@/lib/api/auth-client";

interface CheckoutFormProps {
  cartId: string;
  initialCustomer: any;
}

export default function CheckoutForm({ cartId, initialCustomer }: CheckoutFormProps) {
  const router = useRouter();
  const { setCart } = useCartStore();
  const [cart, setCartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [firstName, setFirstName] = useState(initialCustomer?.firstName || "");
  const [lastName, setLastName] = useState(initialCustomer?.lastName || "");
  const [email, setEmail] = useState(initialCustomer?.email || "");
  const [phone, setPhone] = useState(initialCustomer?.phone || "");
  const [address1, setAddress1] = useState(initialCustomer?.defaultAddress?.address1 || "");
  const [address2, setAddress2] = useState(initialCustomer?.defaultAddress?.address2 || "");
  const [city, setCity] = useState(initialCustomer?.defaultAddress?.city || "");
  const [province, setProvince] = useState(initialCustomer?.defaultAddress?.province || "");
  const [zip, setZip] = useState(initialCustomer?.defaultAddress?.zip || "");
  const [country, setCountry] = useState(initialCustomer?.defaultAddress?.country || "India");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  
  // Card Details (Mock)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // Promo Code States
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [prepaidDiscountPercent, setPrepaidDiscountPercent] = useState(8);

  useEffect(() => {
    // Generate random percentage between 5% and 10%
    const pct = Math.floor(Math.random() * 6) + 5; // 5, 6, 7, 8, 9, 10
    setPrepaidDiscountPercent(pct);
  }, []);

  useEffect(() => {
    async function loadCart() {
      if (!cartId) {
        setLoading(false);
        return;
      }
      const res = await getCartForCheckout(cartId);
      if (res.success && res.cart) {
        setCartData(res.cart);
      } else {
        setError(res.error || "Failed to load your cart.");
      }
      setLoading(false);
    }
    loadCart();
  }, [cartId]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !cart) return;
    setCheckingPromo(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const res = await applyPromoCode(promoCode, parseFloat(cart.subtotal));
      if (res.success && res.discountAmount !== undefined) {
        setDiscount(res.discountAmount);
        setAppliedCode(res.code || promoCode.toUpperCase().trim());
        setPromoSuccess(`Promo applied! Saved ₹${res.discountAmount.toFixed(0)}`);
      } else {
        setPromoError(res.error || "Failed to apply code.");
      }
    } catch (err) {
      console.error(err);
      setPromoError("Failed to apply promo code.");
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedCode("");
    setPromoCode("");
    setPromoSuccess("");
    setPromoError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!getTokenFromCookie()) {
      router.push("/account/login");
      return;
    }
    setSubmitting(true);

    if (!firstName || !lastName || !email || !phone || !address1 || !city || !province || !zip || !country) {
      setError("Please fill in all shipping details.");
      setSubmitting(false);
      return;
    }

    if (paymentMethod === "CARD") {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setError("Please enter your credit/debit card details.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await submitOrder({
        cartId,
        firstName,
        lastName,
        email,
        phone,
        address1,
        address2,
        city,
        province,
        zip,
        country,
        paymentMethod,
        cardNumber: paymentMethod === "CARD" ? cardNumber : undefined,
        cardExpiry: paymentMethod === "CARD" ? cardExpiry : undefined,
        cardCvv: paymentMethod === "CARD" ? cardCvv : undefined,
        promoCode: appliedCode || undefined,
        discount: discount + prepaidDiscountAmount,
      });

      if (res.success && res.orderId) {
        // Clear cart in state
        setCart({
          id: null,
          checkoutUrl: null,
          totalQuantity: 0,
          lines: [],
          subtotal: "0.00",
        });
        
        // Redirect to success page
        router.push(`/checkout/success?orderId=${res.orderId}&number=${res.orderNumber}`);
      } else {
        setError(res.error || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-bgClr">
        <div className="w-12 h-12 border-4 border-maroonClr border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Securing checkout session...</p>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="container mx-auto px-4 py-16 text-center bg-bgClr max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Checkout Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="inline-block bg-maroonClr text-white px-6 py-3 rounded font-medium hover:bg-maroonClr/90">
          Return to Storefront
        </Link>
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center bg-bgClr max-w-md">
        <Sparkles className="w-16 h-16 text-goldClr mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Add products to your cart before checking out.</p>
        <Link href="/products" className="inline-block bg-maroonClr text-white px-6 py-3 rounded font-medium hover:bg-maroonClr/90">
          Shop Curated Sarees
        </Link>
      </div>
    );
  }

  const isPrepaid = paymentMethod === "CARD";
  const prepaidDiscountAmount = isPrepaid 
    ? parseFloat(((parseFloat(cart.subtotal) - discount) * (prepaidDiscountPercent / 100)).toFixed(2))
    : 0;
  const finalTotal = parseFloat(cart.subtotal) - discount - prepaidDiscountAmount;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Navigation back */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-maroonClr transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to store
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Form Area */}
          <div className="flex-1 w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-maroonClr mb-8 pb-4 border-b border-gray-100 flex items-center gap-2">
              Shipping & Payment
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Contact */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 uppercase tracking-wider mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-md font-semibold text-gray-800 uppercase tracking-wider mb-4">Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      placeholder="Flat, House no., Building, Company, Apartment"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      placeholder="Area, Street, Sector, Village"
                      className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">State / Province</label>
                      <input
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="State"
                        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Pincode / ZIP</label>
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="e.g. 700001"
                        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Country</label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="India"
                        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-md font-semibold text-gray-800 uppercase tracking-wider mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* COD Option */}
                  <label className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-maroonClr ${paymentMethod === "COD" ? "border-maroonClr bg-maroonClr/5" : "border-gray-200"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="w-4 h-4 text-maroonClr focus:ring-maroonClr accent-maroonClr"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Cash on Delivery (COD)</p>
                        <p className="text-xs text-gray-500">Pay cash upon delivery at your doorstep.</p>
                      </div>
                    </div>
                    <Truck className="w-5 h-5 text-maroonClr" />
                  </label>

                  {/* Card Option */}
                  <label className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all hover:border-maroonClr ${paymentMethod === "CARD" ? "border-maroonClr bg-maroonClr/5" : "border-gray-200"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "CARD"}
                        onChange={() => setPaymentMethod("CARD")}
                        className="w-4 h-4 text-maroonClr focus:ring-maroonClr accent-maroonClr"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                          Credit / Debit Card
                          <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Flat {prepaidDiscountPercent}% Off
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">Pay securely with card options.</p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-maroonClr" />
                  </label>
                </div>

                {/* Card Fields (Conditional) */}
                {paymentMethod === "CARD" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        placeholder="1234 5678 1234 5678"
                        className="w-full border border-gray-300 bg-white rounded px-4 py-2 text-sm focus:outline-none focus:border-maroonClr"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                          placeholder="MM/YY"
                          className="w-full border border-gray-300 bg-white rounded px-4 py-2 text-sm focus:outline-none focus:border-maroonClr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">CVV</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="***"
                          className="w-full border border-gray-300 bg-white rounded px-4 py-2 text-sm focus:outline-none focus:border-maroonClr"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-maroonClr text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-[#6A102A] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>Place Order (₹{finalTotal.toFixed(0)})</>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Order Summary */}
          <div className="w-full lg:w-[380px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
              Order Summary
            </h2>

            {/* Product list */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar mb-6">
              {cart.lines.map((line: any) => (
                <div key={line.id} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-gray-50 relative rounded overflow-hidden border border-gray-100 flex-shrink-0">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-maroonClr/5 flex items-center justify-center text-maroonClr/30 font-bold text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate hover:text-maroonClr transition-colors">
                      {line.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">Variant: {line.variantTitle}</p>
                    <p className="text-xs text-gray-400">Qty: {line.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-gray-800 text-sm">
                      {line.isGift ? (
                        <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded text-[10px] border border-green-100">FREE</span>
                      ) : (
                        `₹${parseFloat(line.price).toFixed(0)}`
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-gray-100 pt-4 pb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Have a Promo Code?</label>
              {appliedCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 rounded-lg px-3 py-2 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 uppercase">
                    <Tag className="w-3.5 h-3.5 text-green-600" /> {appliedCode} (Saved ₹{discount.toFixed(0)})
                  </span>
                  <button 
                    type="button" 
                    onClick={handleRemovePromo}
                    className="text-green-600 hover:text-green-800 p-0.5 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. VASTRAA10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 uppercase focus:outline-none focus:border-maroonClr"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={checkingPromo || !promoCode}
                    className="bg-maroonClr text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#6A102A] transition-colors disabled:opacity-55"
                  >
                    {checkingPromo ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {promoError && <p className="text-[10px] text-red-600 font-semibold mt-1.5">{promoError}</p>}
              {promoSuccess && <p className="text-[10px] text-green-600 font-semibold mt-1.5">{promoSuccess}</p>}
            </div>

            {/* Calculations */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Subtotal ({cart.totalQuantity} items)</span>
                <span>₹{parseFloat(cart.subtotal).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span className="flex items-center gap-1">Discount ({appliedCode})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              {isPrepaid && prepaidDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold animate-fadeIn">
                  <span className="flex items-center gap-1">Prepaid Discount ({prepaidDiscountPercent}%)</span>
                  <span>-₹{prepaidDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold uppercase tracking-wider text-xs">Free</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Taxes</span>
                <span className="text-xs text-gray-400">Included</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-gray-800">
                <span className="font-bold uppercase tracking-wider text-xs">Total</span>
                <span className="font-bold text-xl text-maroonClr">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium">
                <Shield className="w-4 h-4 text-goldClr flex-shrink-0" />
                <span>100% Authentic Handloom Products</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium">
                <Truck className="w-4 h-4 text-goldClr flex-shrink-0" />
                <span>Safe & Secure Doorstep Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
