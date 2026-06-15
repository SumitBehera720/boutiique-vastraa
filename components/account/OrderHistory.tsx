import Image from "next/image";
import Link from "next/link";

export default function OrderHistory({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
        <h3 className="text-xl font-serif text-gray-800 mb-2">No Orders Yet</h3>
        <p className="text-gray-500 mb-6">You haven't placed any orders with us.</p>
        <Link 
          href="/collections/all"
          className="bg-primary text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-wider hover:bg-[#6A102A] transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order Placed</p>
              <p className="text-gray-800">{new Date(order.processedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total</p>
              <p className="text-gray-800 font-bold">₹{parseFloat(order.totalPrice.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order #</p>
              <p className="text-gray-800">{order.orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                order.financialStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                {order.financialStatus}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                order.fulfillmentStatus === "FULFILLED" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-800"
              }`}>
                {order.fulfillmentStatus || "UNFULFILLED"}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {order.lineItems.edges.map((edge: any, index: number) => {
                const item = edge.node;
                return (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="relative w-16 h-20 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      {item.variant?.image?.url && (
                        <Image 
                          src={item.variant.image.url} 
                          alt={item.title} 
                          fill 
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-2">{item.title}</p>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
