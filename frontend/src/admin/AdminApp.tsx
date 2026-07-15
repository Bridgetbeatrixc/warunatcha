import type { Session } from "@supabase/supabase-js";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { formatRupiah } from "../basket";
import { GrowlaneLogo } from "../BrandCredit";
import { logoImage } from "../menuData";
import { getOrders, getOrderSummary, setOrderStatus } from "./adminApi";
import { adminSupabase, hasSupabaseConfig } from "./supabase";
import type { AdminOrder, OrderStatus, OrderSummary } from "./types";

const statuses: Array<OrderStatus | "all"> = ["all", "new", "preparing", "finished", "cancelled"];
const emptySummary: OrderSummary = { total: 0, new: 0, preparing: 0, finished: 0, cancelled: 0, revenue: 0 };

const statusColors: Record<OrderStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  finished: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminLogin({ onSession }: { onSession: (session: Session) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminSupabase) return;
    setLoading(true);
    setError("");
    const { data, error: loginError } = await adminSupabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError || !data.session) {
      setError(loginError?.message || "Login failed.");
      return;
    }
    onSession(data.session);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f1e7] px-5 py-10 font-['Source_Sans_3'] text-slate-900">
      <section className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-emerald-950/10">
        <div className="bg-[#103c32] px-7 py-8 text-white">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Warunatcha" className="h-12 w-12 rounded-full border-2 border-white/20 object-cover" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Warunatcha</p>
              <h1 className="mt-1 font-['Merriweather'] text-2xl font-bold">Order dashboard</h1>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-white/65">Sign in with the approved Supabase administrator account.</p>
        </div>

        <form onSubmit={login} className="space-y-5 p-7">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-md border border-slate-300 px-4 font-medium outline-none ring-emerald-700 transition focus:border-emerald-700 focus:ring-2"
              placeholder="owner@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-md border border-slate-300 px-4 font-medium outline-none ring-emerald-700 transition focus:border-emerald-700 focus:ring-2"
              required
            />
          </label>

          {!hasSupabaseConfig ? (
            <p className="rounded-md bg-amber-50 p-3 text-sm font-medium text-amber-800">Add the Supabase frontend variables before using admin login.</p>
          ) : null}
          {error ? <p className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !hasSupabaseConfig}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#103c32] font-bold text-white transition hover:bg-[#185345] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="border-t border-slate-100 px-7 py-5">
          <GrowlaneLogo className="mx-auto w-40" />
        </div>
      </section>
    </main>
  );
}

function Dashboard({ session }: { session: Session }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [summary, setSummary] = useState<OrderSummary>(emptySummary);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const [orderData, summaryData] = await Promise.all([
        getOrders(session.access_token, { status, search, page }),
        getOrderSummary(session.access_token),
      ]);
      setOrders(orderData.orders);
      setTotal(orderData.total);
      setSummary(summaryData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Dashboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [page, search, session.access_token, status]);

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(() => void loadData(true), 30000);
    return () => window.clearInterval(interval);
  }, [loadData]);

  async function updateStatus(order: AdminOrder, nextStatus: OrderStatus) {
    setUpdatingId(order.id);
    setError("");
    try {
      await setOrderStatus(session.access_token, order.id, nextStatus);
      await loadData(true);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Order could not be updated.");
    } finally {
      setUpdatingId("");
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const pageCount = Math.max(1, Math.ceil(total / 20));
  const summaryCards = [
    { label: "Today's orders", value: summary.total, accent: "border-slate-300" },
    { label: "New", value: summary.new, accent: "border-amber-400" },
    { label: "Preparing", value: summary.preparing, accent: "border-blue-400" },
    { label: "Finished", value: summary.finished, accent: "border-emerald-500" },
    { label: "Revenue", value: formatRupiah(summary.revenue), accent: "border-violet-500" },
  ];

  return (
    <main className="min-h-screen bg-[#f5f3eb] font-['Source_Sans_3'] text-slate-900">
      <header className="border-b border-emerald-950/10 bg-[#103c32] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Warunatcha" className="h-11 w-11 rounded-full border-2 border-white/20 object-cover" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">Warunatcha</p>
              <h1 className="font-['Merriweather'] text-xl font-bold">Orders</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-md bg-white px-3 py-2 sm:block">
              <GrowlaneLogo className="w-32" />
            </div>
            <button
              type="button"
              onClick={() => void adminSupabase?.auth.signOut()}
              className="grid h-10 w-10 place-items-center rounded-md border border-white/20 text-white transition hover:bg-white/10"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {summaryCards.map((card) => (
            <article key={card.label} className={`rounded-md border border-slate-200 border-t-4 ${card.accent} bg-white p-4 shadow-sm`}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
              <strong className="mt-2 block text-2xl font-bold text-slate-900">{card.value}</strong>
            </article>
          ))}
        </section>

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {statuses.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => { setPage(1); setStatus(filter); }}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold capitalize transition ${status === filter ? "bg-[#103c32] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <form onSubmit={submitSearch} className="flex min-w-0 flex-1 lg:w-72">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-l-md border border-r-0 border-slate-300 px-3 text-sm outline-none focus:border-emerald-700"
                  placeholder="Name, phone, or order #"
                  aria-label="Search orders"
                />
                <button type="submit" className="grid h-10 w-10 place-items-center rounded-r-md bg-slate-900 text-white" aria-label="Search">
                  <Search className="h-4 w-4" />
                </button>
              </form>
              <button
                type="button"
                onClick={() => void loadData()}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                title="Refresh orders"
                aria-label="Refresh orders"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {error ? <p className="m-4 rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

          <div className="hidden grid-cols-[100px_150px_minmax(160px,1fr)_minmax(220px,1.4fr)_120px_130px_220px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:grid">
            <span>Order</span><span>Time</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span><span>Actions</span>
          </div>

          <div className="divide-y divide-slate-200">
            {loading && orders.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm font-medium text-slate-500">
                <LoaderCircle className="h-5 w-5 animate-spin" /> Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <p className="px-4 py-16 text-center text-sm font-medium text-slate-500">No orders match this view.</p>
            ) : orders.map((order) => (
              <article key={order.id} className="grid gap-4 px-4 py-5 lg:grid-cols-[100px_150px_minmax(160px,1fr)_minmax(220px,1.4fr)_120px_130px_220px] lg:items-center">
                <div className="flex items-center justify-between lg:block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 lg:hidden">Order</span>
                  <strong className="text-base text-slate-900">#{order.order_number}</strong>
                </div>
                <p className="text-xs font-medium leading-5 text-slate-500">{formatDate(order.created_at)}</p>
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{order.customer_name}</p>
                  <a href={`tel:${order.customer_phone}`} className="mt-1 block text-xs font-medium text-emerald-800 hover:underline">{order.customer_phone}</a>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3">
                      <div>
                        <p>{item.name}</p>
                        {item.options ? <p className="text-[10px] text-slate-400">{item.options.seasonalAddOn} · {item.options.sugarLevel}% · {item.options.milkOption}</p> : null}
                      </div>
                      <strong className="text-slate-800">x{item.quantity}</strong>
                    </div>
                  ))}
                </div>
                <strong className="text-sm text-slate-900">{formatRupiah(order.total_amount)}</strong>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColors[order.status]}`}>{order.status}</span>
                <div className="flex flex-wrap gap-2">
                  {order.status === "new" ? (
                    <button
                      type="button"
                      onClick={() => void updateStatus(order, "preparing")}
                      disabled={updatingId === order.id}
                      className="flex h-9 items-center gap-2 rounded-md bg-blue-100 px-3 text-xs font-bold text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                    >
                      <CookingPot className="h-4 w-4" /> Prepare
                    </button>
                  ) : null}
                  {order.status === "new" || order.status === "preparing" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void updateStatus(order, "finished")}
                        disabled={updatingId === order.id}
                        className="flex h-9 items-center gap-2 rounded-md bg-emerald-700 px-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" /> Finish
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateStatus(order, "cancelled")}
                        disabled={updatingId === order.id}
                        className="grid h-9 w-9 place-items-center rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        title="Cancel order"
                        aria-label={`Cancel order ${order.order_number}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  ) : <span className="text-xs font-medium text-slate-400">Completed</span>}
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">Page {page} of {pageCount} · {total} orders</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-600 disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page >= pageCount} className="grid h-9 w-9 place-items-center rounded-md border border-slate-300 text-slate-600 disabled:opacity-30" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!adminSupabase) {
      setCheckingSession(false);
      return;
    }
    void adminSupabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data } = adminSupabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f1e7] font-['Source_Sans_3']"><LoaderCircle className="h-7 w-7 animate-spin text-emerald-900" /></main>;
  }

  return session ? <Dashboard session={session} /> : <AdminLogin onSession={setSession} />;
}
