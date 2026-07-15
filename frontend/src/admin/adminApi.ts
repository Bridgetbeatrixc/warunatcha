import type { AdminOrder, OrderStatus, OrderSummary } from "./types";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

async function adminRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Admin request failed.");
  return data as T;
}

export function getOrders(token: string, filters: { status: OrderStatus | "all"; search: string; page: number }) {
  const params = new URLSearchParams({ status: filters.status, search: filters.search, page: String(filters.page), limit: "20" });
  return adminRequest<{ orders: AdminOrder[]; total: number; page: number; limit: number }>(`/api/orders?${params}`, token);
}

export function getOrderSummary(token: string) {
  return adminRequest<OrderSummary>("/api/orders/summary", token);
}

export function setOrderStatus(token: string, id: string, status: OrderStatus) {
  return adminRequest<{ order: Pick<AdminOrder, "id" | "status" | "updated_at" | "finished_at" | "cancelled_at"> }>(
    `/api/orders/${id}/status`,
    token,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
}
