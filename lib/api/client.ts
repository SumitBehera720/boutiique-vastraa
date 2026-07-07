const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function getToken(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("boutiique_vastraa_customer_token")?.value ?? null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const token = await getToken();

  const url = new URL(`${API_URL}/api${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url.toString(), {
    ...options,
    headers,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let data: any;
    try {
      data = await res.json();
    } catch {
      data = await res.text().catch(() => null);
    }
    throw new ApiError(res.status, data?.message || res.statusText || "API Error", data);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function apiGet<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET", params });
}

export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", body });
}

export async function apiPut<T>(endpoint: string, body?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PUT", body });
}

export async function apiPatch<T>(endpoint: string, body?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PATCH", body });
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" });
}
