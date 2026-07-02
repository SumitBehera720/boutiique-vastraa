import { verifyAdminSession } from "@/app/actions/adminAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | Boutiique Vastraa",
  description: "Advanced administrative dashboard for Boutiique Vastraa store management.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLogged = await verifyAdminSession();

  if (!isLogged) {
    // Return children directly (the login page) without the sidebar dashboard frame
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto h-screen p-8 bg-neutral-900 custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
