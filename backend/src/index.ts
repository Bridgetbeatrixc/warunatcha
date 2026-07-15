import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import type { Context } from "hono";
import { canTransitionOrder, isOrderStatus, validateOrder } from "./orders";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  FRONTEND_ORIGINS: string;
  ADMIN_EMAILS: string;
};

type AppContext = Context<{ Bindings: Bindings }>;
const app = new Hono<{ Bindings: Bindings }>();

function origins(env: Bindings) {
  return new Set(env.FRONTEND_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean));
}

function database(c: AppContext) {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireAdmin(c: AppContext) {
  const authorization = c.req.header("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return { error: c.json({ error: "Authentication required." }, 401) };

  const { data, error } = await database(c).auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  const admins = new Set(c.env.ADMIN_EMAILS.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean));
  if (error || !email) return { error: c.json({ error: "Your admin session is invalid or expired." }, 401) };
  if (!admins.has(email)) return { error: c.json({ error: "This account is not an approved administrator." }, 403) };
  return { user: data.user };
}

app.use("/api/*", async (c, next) => {
  const origin = c.req.header("Origin");
  if (origin && !origins(c.env).has(origin)) return c.json({ error: "Origin is not allowed." }, 403);

  if (c.req.method === "OPTIONS") {
    if (origin) c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    c.header("Access-Control-Max-Age", "86400");
    return c.body(null, 204);
  }

  await next();
  if (origin) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
  }
});

app.get("/api/health", async (c) => {
  const { error } = await database(c).from("orders").select("id", { head: true, count: "exact" }).limit(1);
  return c.json({ ok: !error, storage: "supabase" }, error ? 503 : 200);
});

app.post("/api/orders", async (c) => {
  if (Number(c.req.header("Content-Length") ?? 0) > 30000) {
    return c.json({ error: "Order payload is too large." }, 413);
  }

  let payload: unknown;
  try {
    const rawBody = await c.req.text();
    if (rawBody.length > 30000) return c.json({ error: "Order payload is too large." }, 413);
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ error: "Order payload must be valid JSON." }, 400);
  }

  const validation = validateOrder(payload);
  if ("error" in validation) return c.json({ error: validation.error }, 400);

  const { data, error } = await database(c)
    .from("orders")
    .insert(validation.order)
    .select("id, order_number")
    .single();
  if (error || !data) {
    console.error("order_insert_failed", error?.message);
    return c.json({ error: "Order could not be saved." }, 500);
  }
  return c.json({ id: data.id, orderNumber: data.order_number, storage: "supabase" }, 201);
});

app.get("/api/orders", async (c) => {
  const auth = await requireAdmin(c);
  if (auth.error) return auth.error;

  const status = c.req.query("status") ?? "all";
  const search = (c.req.query("search") ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(c.req.query("page") ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(c.req.query("limit") ?? "20", 10) || 20));
  const start = (page - 1) * limit;

  let query = database(c)
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, items, total_amount, status, created_at, updated_at, finished_at, cancelled_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, start + limit - 1);

  if (status !== "all") {
    if (!isOrderStatus(status)) return c.json({ error: "Invalid order status." }, 400);
    query = query.eq("status", status);
  }
  const from = c.req.query("from");
  const to = c.req.query("to");
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  if (search) {
    const safeSearch = search.replace(/[^\p{L}\p{N}\s+.-]/gu, "");
    if (/^\d+$/.test(safeSearch)) {
      query = query.or(`order_number.eq.${safeSearch},customer_phone.ilike.%${safeSearch}%`);
    } else if (safeSearch) {
      query = query.ilike("customer_name", `%${safeSearch}%`);
    }
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("order_list_failed", error.message);
    return c.json({ error: "Orders could not be loaded." }, 500);
  }
  return c.json({ orders: data ?? [], page, limit, total: count ?? 0 });
});

app.get("/api/orders/summary", async (c) => {
  const auth = await requireAdmin(c);
  if (auth.error) return auth.error;
  const { data, error } = await database(c).rpc("get_order_summary", { p_timezone: "Asia/Jakarta" });
  if (error) {
    console.error("order_summary_failed", error.message);
    return c.json({ error: "Order summary could not be loaded." }, 500);
  }
  return c.json(data);
});

app.patch("/api/orders/:id/status", async (c) => {
  const auth = await requireAdmin(c);
  if (auth.error) return auth.error;

  let body: { status?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Status payload must be valid JSON." }, 400);
  }
  if (!body.status || !isOrderStatus(body.status)) return c.json({ error: "Invalid order status." }, 400);

  const client = database(c);
  const { data: current, error: findError } = await client
    .from("orders")
    .select("id, status")
    .eq("id", c.req.param("id"))
    .maybeSingle();
  if (findError) return c.json({ error: "Order could not be loaded." }, 500);
  if (!current) return c.json({ error: "Order not found." }, 404);
  if (!isOrderStatus(current.status) || !canTransitionOrder(current.status, body.status)) {
    return c.json({ error: `Order cannot move from ${current.status} to ${body.status}.` }, 409);
  }

  const now = new Date().toISOString();
  const { data, error } = await client
    .from("orders")
    .update({
      status: body.status,
      updated_at: now,
      finished_at: body.status === "finished" ? now : null,
      cancelled_at: body.status === "cancelled" ? now : null,
    })
    .eq("id", current.id)
    .eq("status", current.status)
    .select("id, status, updated_at, finished_at, cancelled_at")
    .maybeSingle();
  if (error) return c.json({ error: "Order status could not be updated." }, 500);
  if (!data) return c.json({ error: "Order changed while it was being updated. Refresh and try again." }, 409);
  return c.json({ order: data });
});

app.notFound((c) => c.json({ error: "Not found." }, 404));
app.onError((error, c) => {
  console.error("worker_error", error.message);
  return c.json({ error: "Unexpected server error." }, 500);
});

export default app;
