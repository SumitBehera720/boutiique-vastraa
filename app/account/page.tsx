import { redirect } from "next/navigation";
import { getCustomerToken, logoutAction } from "@/app/actions/auth";
import { getCustomer } from "@/lib/shopify/queries";
import OrderHistory from "@/components/account/OrderHistory";

export default async function AccountPage() {
  const token = await getCustomerToken();
  
  if (!token) {
    redirect("/account/login");
  }

  const customer = await getCustomer(token);

  if (!customer) {
    // Token might be invalid or expired
    await logoutAction();
    redirect("/account/login");
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif text-gray-900 font-bold mb-2">
              My Account
            </h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold text-primary">{customer.firstName || customer.email}</span>
            </p>
          </div>
          <form action={logoutAction} className="inline">
            <button 
              type="submit" 
              className="text-sm font-semibold text-gray-500 hover:text-red-600 underline transition-colors"
            >
              Log out
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Order History */}
          <div className="flex-1">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Order History</h2>
            <OrderHistory orders={customer.orders?.edges.map((e: any) => e.node) || []} />
          </div>

          {/* Account Details Sidebar */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Account Details</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="font-semibold text-gray-800 mb-1">{customer.firstName} {customer.lastName}</p>
              <p className="text-gray-600 mb-4 text-sm">{customer.email}</p>
              
              {customer.phone && (
                <p className="text-gray-600 mb-4 text-sm">{customer.phone}</p>
              )}

              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-widest mb-3">Default Address</h3>
                {customer.defaultAddress ? (
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>{customer.defaultAddress.address1}</p>
                    {customer.defaultAddress.address2 && <p>{customer.defaultAddress.address2}</p>}
                    <p>{customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}</p>
                    <p>{customer.defaultAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No default address saved.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
