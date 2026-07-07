"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/client";

export async function verifyAdminSession() {
  try {
    const me = await apiGet<any>("/auth/me");
    return me?.email?.toLowerCase() === "admin@boutiquevastra.com";
  } catch {
    return false;
  }
}

export async function adminLogoutAction() {
  try {
    const { apiPost } = await import("@/lib/api/client");
    await apiPost("/auth/logout").catch(() => {});
  } catch {}
  const cookieStore = await cookies();
  cookieStore.delete("boutiique_vastraa_customer_token");
  redirect("/account/login");
}
