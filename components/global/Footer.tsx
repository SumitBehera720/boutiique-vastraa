export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div>
            <div className="bg-white text-primary p-2 w-16 h-16 flex items-center justify-center mb-6 rounded">
              <span className="font-serif text-xs text-center font-bold">Boutiique Vastraa</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              Timeless Elegance, Handcrafted for Every Occasion. Shop our exclusive range of luxury sarees, designer kurtis, and jewellery.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-secondary">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Track Order</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-secondary">Policies</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-secondary">Newsletter</h3>
            <p className="text-sm text-gray-300 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border border-gray-400 text-white px-4 py-2 w-full rounded focus:outline-none focus:border-secondary transition"
              />
              <button className="bg-secondary text-primary px-4 py-2 rounded font-medium hover:bg-white transition">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-600 text-center text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Boutiique Vastraa. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
