"use server";

import { jsonDb } from "@/lib/db/jsonDb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const CUSTOMER_COOKIE_NAME = "boutiique_vastraa_customer_token";
const ADMIN_EMAIL = "admin@boutiquevastra.com";

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value || null;
  if (!token) return false;

  const customer = jsonDb.getCustomerById(token);
  return customer ? customer.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() : false;
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
  redirect("/account/login");
}
