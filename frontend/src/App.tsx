import { FormEvent, useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingBag } from "lucide-react";
import { saveOrder } from "./api";
import { addItem, BasketItem, formatRupiah, getBasketCount, getBasketTotal, updateQuantity } from "./basket";
import { BrandCredit } from "./BrandCredit";
import { buildBasketWhatsappMessage, buildBasketWhatsappUrl } from "./whatsapp";
import { categories, Category, logoImage, menuBoardImage, menuItems } from "./menuData";

type Customer = { name: string; phone: string };

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "" });
  const [checkoutState, setCheckoutState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const basketCount = getBasketCount(basket);
  const basketTotal = getBasketTotal(basket);
  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const queryMatch = !search || item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutState("saving");
    setCheckoutMessage("");
    const baseMessage = buildBasketWhatsappMessage({
      customerName: customer.name,
      customerPhone: customer.phone,
      items: basket,
    });

    try {
      const savedOrder = await saveOrder({
        customerName: customer.name,
        customerPhone: customer.phone,
        items: basket,
        whatsappMessage: baseMessage,
      });
      const whatsappMessage = buildBasketWhatsappMessage({
        customerName: customer.name,
        customerPhone: customer.phone,
        items: basket,
        orderNumber: savedOrder.orderNumber,
      });
      setCheckoutState("saved");
      setCheckoutMessage(`Order #${savedOrder.orderNumber} saved. Opening WhatsApp.`);
      window.open(buildBasketWhatsappUrl(whatsappMessage), "_blank", "noopener,noreferrer");
    } catch (error) {
      setCheckoutState("error");
      setCheckoutMessage(error instanceof Error ? error.message : "Order could not be saved.");
    }
  }

  const checkoutDisabled = checkoutState === "saving" || basket.length === 0 || customer.name.trim().length < 2 || customer.phone.trim().length < 8;

  return (
    <main className="min-h-screen min-w-[320px] bg-[#ebe4d5] px-0 py-0 text-[#172338] sm:px-5 sm:py-5">
      <div className="mx-auto grid max-w-7xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden bg-[#123b31] shadow-2xl shadow-emerald-950/15 sm:rounded-lg">
          <header className="px-5 pb-5 pt-6 text-white sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={logoImage} alt="Warunatcha" className="h-12 w-12 shrink-0 rounded-full border-2 border-white/20 object-cover" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Pickup order</p>
                  <p className="mt-1 truncate text-sm font-bold text-white/85">Warunatcha Matcha</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" })}
                className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/15"
                aria-label="Open shopping basket"
              >
                <ShoppingBag className="h-5 w-5" />
                {basketCount > 0 ? <strong className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#f2c46b] px-1 text-xs text-[#123b31]">{basketCount}</strong> : null}
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9d4a8]">Fresh today</p>
                <h1 className="mt-2 max-w-xl text-4xl font-bold leading-none sm:text-5xl">Ceremonial matcha, made fresh.</h1>
              </div>
              <div className="min-w-48 rounded-md border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Your basket</p>
                <strong className="mt-2 block text-2xl">{formatRupiah(basketTotal)}</strong>
                <span className="text-xs font-semibold text-white/55">{basketCount} item selected</span>
              </div>
            </div>

            <label className="relative mt-6 block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-full border border-white/10 bg-[#0d2d26] pl-11 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-white/30"
                placeholder="Search the menu"
                type="search"
                aria-label="Search menu"
              />
            </label>
          </header>

          <div className="rounded-t-lg bg-[#f9f5ea] px-4 pb-8 pt-5 sm:px-7">
            <nav className="grid grid-cols-4 gap-1 pb-4 sm:flex sm:gap-2" aria-label="Menu categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`min-w-0 rounded-full border px-2 py-3 text-xs font-bold transition sm:shrink-0 sm:px-5 sm:text-sm ${activeCategory === category ? "border-[#123b31] bg-[#123b31] text-white shadow-lg shadow-emerald-950/10" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
                >
                  {category}
                </button>
              ))}
            </nav>

            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{activeCategory === "All" ? "All drinks" : activeCategory}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{visibleItems.length} menu choices</p>
              </div>
              <span className="rounded-full bg-[#e9dfbd] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5d512f]">Open</span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {visibleItems.map((item) => {
                const selectedQuantity = basket.find((basketItem) => basketItem.id === item.id)?.quantity || 0;
                return (
                  <article key={item.id} className="flex min-h-[310px] flex-col rounded-lg border border-slate-100 bg-white p-3 shadow-lg shadow-emerald-950/5 sm:min-h-[352px] sm:p-4">
                    <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-[#f0eadc]">
                      {item.badge ? <span className="absolute left-2 top-2 z-10 rounded-full bg-[#123b31] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">{item.badge}</span> : null}
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full scale-[1.4] object-contain"
                        onError={(event) => { event.currentTarget.src = logoImage; }}
                      />
                    </div>
                    <div className="px-1 pt-3">
                      <h3 className="min-h-10 text-sm font-bold leading-tight sm:text-base">{item.name}</h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-xs font-medium leading-5 text-slate-500">{item.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <strong className="text-sm sm:text-base">{item.price}</strong>
                      <button
                        type="button"
                        onClick={() => setBasket((current) => addItem(current, item))}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#123b31] font-bold text-white transition hover:bg-[#185345]"
                        aria-label={`Add ${item.name} to basket`}
                      >
                        {selectedQuantity > 0 ? selectedQuantity : <Plus className="h-5 w-5" />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <section className="mt-6 rounded-lg bg-white p-4 shadow-lg shadow-emerald-950/5" aria-label="Full menu board">
              <h2 className="text-2xl font-bold">Full menu</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Classic prices, seasonal powder upgrades, sugar level, and milk options.</p>
              <img src={menuBoardImage} alt="Warunatcha full menu with prices and options" loading="lazy" className="mt-4 max-h-[720px] w-full rounded-md bg-[#f7f2df] object-contain" />
            </section>
          </div>
        </section>

        <aside id="checkout" className="bg-[#123b31] p-5 text-white shadow-2xl shadow-emerald-950/15 sm:rounded-lg lg:sticky lg:top-5">
          <form onSubmit={handleCheckout}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Checkout</p>
                <h2 className="mt-1 text-2xl font-bold">Shopping basket</h2>
              </div>
              <strong className="rounded-full bg-white px-3 py-2 text-sm text-[#123b31]">{formatRupiah(basketTotal)}</strong>
            </div>

            <div className="mt-5 space-y-3">
              {basket.length === 0 ? (
                <div className="rounded-md border border-dashed border-white/20 p-5 text-sm font-medium leading-6 text-white/60">Your basket is empty.</div>
              ) : basket.map((item) => (
                <div key={item.id} className="grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 rounded-md bg-white/10 p-3">
                  <img src={item.image} alt="" className="h-[54px] w-[54px] rounded-md bg-white/10 object-contain p-1" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <span className="mt-1 block text-xs font-semibold text-white/60">{formatRupiah(item.priceValue * item.quantity)}</span>
                  </div>
                  <div className="flex items-center rounded-full bg-white text-[#123b31]">
                    <button type="button" onClick={() => setBasket((items) => updateQuantity(items, item.id, item.quantity - 1))} className="grid h-8 w-8 place-items-center" aria-label={`Remove one ${item.name}`}><Minus className="h-4 w-4" /></button>
                    <strong className="min-w-5 text-center text-xs">{item.quantity}</strong>
                    <button type="button" onClick={() => setBasket((items) => updateQuantity(items, item.id, item.quantity + 1))} className="grid h-8 w-8 place-items-center" aria-label={`Add one ${item.name}`}><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Name</span>
                <input value={customer.name} onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))} className="h-12 w-full rounded-md border border-white/10 bg-white/10 px-4 font-semibold text-white outline-none placeholder:text-white/30 focus:border-white/30" placeholder="Customer name" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Phone number</span>
                <input value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} className="h-12 w-full rounded-md border border-white/10 bg-white/10 px-4 font-semibold text-white outline-none placeholder:text-white/30 focus:border-white/30" placeholder="08xxxxxxxxxx" inputMode="tel" required />
              </label>
            </div>

            <div className="mt-5 overflow-hidden rounded-md bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-[#123b31]"><span className="text-sm font-bold">To be paid</span><strong>{formatRupiah(basketTotal)}</strong></div>
              <button type="submit" disabled={checkoutDisabled} className="h-14 w-full bg-[#f2c46b] font-bold text-[#123b31] transition hover:bg-[#f6cf83] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
                {checkoutState === "saving" ? "Saving order..." : "Save and open WhatsApp"}
              </button>
            </div>

            {checkoutMessage ? <p className={`mt-4 rounded-md p-3 text-sm font-semibold ${checkoutState === "error" ? "bg-rose-500/20 text-rose-100" : "bg-white/10 text-white/75"}`}>{checkoutMessage}</p> : null}
          </form>
        </aside>
      </div>

      <footer className="mx-auto mt-6 max-w-7xl rounded-md bg-white px-5 py-5 sm:mb-1">
        <BrandCredit />
      </footer>
    </main>
  );
}
