import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { jsonDb } from "@/lib/db/jsonDb";
import SettingsFormClient from "@/components/admin/SettingsFormClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configure Site Settings | Boutiique Vastraa",
  description: "Configure search tags, SEO template strings, and homepage hero slides.",
};

export default async function AdminSettingsPage() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  const settings = jsonDb.getSettings();

  return (
    <SettingsFormClient 
      initialSettings={settings} 
    />
  );
}
