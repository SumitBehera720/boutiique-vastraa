import { cookies } from "next/headers";
import { jsonDb } from "@/lib/db/jsonDb";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Boutiique Vastraa",
  description: "Secure checkout for your handcrafted sarees and ethnic wear.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cartId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const cartId = resolvedSearchParams.cartId || "";

  // Check if customer is logged in
  const cookieStore = await cookies();
  const customerToken = cookieStore.get("boutiique_vastraa_customer_token")?.value || null;
  
  let customer = null;
  if (customerToken) {
    const rawCustomer = jsonDb.getCustomerById(customerToken);
    if (rawCustomer) {
      // Exclude passwordHash from client
      customer = {
        id: rawCustomer.id,
        firstName: rawCustomer.firstName,
        lastName: rawCustomer.lastName,
        email: rawCustomer.email,
        phone: rawCustomer.phone || "",
        defaultAddress: rawCustomer.defaultAddress || null
      };
    }
  }

  return (
    <CheckoutForm 
      cartId={cartId} 
      initialCustomer={customer} 
    />
  );
}
