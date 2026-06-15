export default function TrackOrderPage() {
  return (
    <div className="min-h-[70vh] bg-bgClr flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-kalnia text-maroonClr mb-4">Track Your Order</h1>
        <p className="text-neutral-600 text-sm mb-6">Enter your order number to track your shipment.</p>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Order Number"
            className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-maroonClr focus:ring-1 focus:ring-maroonClr"
          />
          <button
            type="submit"
            className="w-full bg-maroonClr text-white py-3 rounded font-medium text-sm hover:bg-maroonClr/80 transition-colors"
          >
            Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
