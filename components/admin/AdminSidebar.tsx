"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/app/actions/adminAuth";
import { LayoutDashboard, Package, FolderHeart, ShoppingBag, Users, LogOut, Sparkles, Tag, MessageSquare, Settings, Smartphone, Gift } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Collections", href: "/admin/collections", icon: FolderHeart },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Promo Codes", href: "/admin/coupons", icon: Tag },
    { name: "Free Gifts", href: "/admin/gifts", icon: Gift },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-neutral-950 border-r border-neutral-850 flex flex-col h-full lg:h-screen lg:sticky lg:top-0 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-maroonClr flex items-center justify-center border border-[#C9A84C]/20">
            <span className="text-[#C9A84C] font-serif font-bold text-sm">BV</span>
          </div>
          <div>
            <h1 className="font-serif text-sm font-bold text-white flex items-center gap-1">
              Boutiique Vastraa <Sparkles className="w-3 h-3 text-[#C9A84C]" />
            </h1>
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-maroonClr text-white shadow-md shadow-maroonClr/10"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#C9A84C]" : "text-neutral-500 group-hover:text-neutral-300"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-neutral-850 bg-neutral-950">
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:bg-red-950/20 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-4 h-4 text-neutral-500 group-hover:text-red-400/80 transition-colors" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
