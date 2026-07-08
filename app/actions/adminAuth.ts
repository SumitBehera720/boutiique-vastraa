"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverGetAuthUser } from "@/lib/server-data";

export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("boutiique_vastraa_customer_token")?.value;
    if (!token) return false;
    const me = await serverGetAuthUser(token);
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
