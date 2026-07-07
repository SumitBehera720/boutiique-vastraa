import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 15000;

const AUTH_COOKIE = "boutiique_vastraa_customer_token";

function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const match = req.cookies.get(AUTH_COOKIE)?.value;
  return match || null;
}

async function proxy(req: NextRequest, method: string) {
  const path = req.nextUrl.pathname.replace("/api/proxy/", "");
  const search = req.nextUrl.search;
  const token = extractToken(req);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  const ct = req.headers.get("content-type") || "";
  if (method !== "GET" && method !== "HEAD") {
    if (ct.includes("application/json")) {
      const text = await req.text().catch(() => "");
      if (text) {
        headers["Content-Type"] = "application/json";
        body = text;
      }
    } else {
      body = req.body || undefined;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/api/${path}${search}`, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseBody = await res.text().catch(() => null);

    return new NextResponse(responseBody, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    clearTimeout(timeout);
    const message = err.name === "AbortError" ? "Backend timeout" : "Backend unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}
export async function POST(req: NextRequest) {
  return proxy(req, "POST");
}
export async function PUT(req: NextRequest) {
  return proxy(req, "PUT");
}
export async function PATCH(req: NextRequest) {
  return proxy(req, "PATCH");
}
export async function DELETE(req: NextRequest) {
  return proxy(req, "DELETE");
}
