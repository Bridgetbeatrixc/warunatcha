import { FormEvent, useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingBag } from "lucide-react";
import { saveOrder } from "./api";
import { addConfiguredItem, BasketItem, formatRupiah, getBasketCount, getBasketTotal, thermalBagPrice, updateQuantity } from "./basket";
import { BrandCredit } from "./BrandCredit";
import { buildBasketWhatsappMessage, buildBasketWhatsappUrl } from "./whatsapp";
import { iceOptions, logoImage, matchaServiceOptions, menuBoardImage, menuItems, menuNavGroups, milkOptions, seasonalAddOns, SugarLevel, sugarLevels, MilkOption } from "./menuData";

type Customer = { name: string; phone: string; address: string };

export default function App() {
  const [activeGroup, setActiveGroup] = useState<"all" | "best-seller" | "signature" | "new">("all");
  const [query, setQuery] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", address: "" });
  const [checkoutState, setCheckoutState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [customizingItem, setCustomizingItem] = useState<(typeof menuItems)[number] | null>(null);
  const [selectedSeasonal, setSelectedSeasonal] = useState(seasonalAddOns[0]);
  const [selectedSugar, setSelectedSugar] = useState<SugarLevel>(50);
  const [selectedMilk, setSelectedMilk] = useState<MilkOption>("Dairy");
  const [selectedIce, setSelectedIce] = useState(iceOptions[1]);
  const [selectedMatchaService, setSelectedMatchaService] = useState(matchaServiceOptions[0]);
  const [paymentMethod, setPaymentMethod] = useState<"BCA" | "OVO" | "GoPay" | "SeaBank">("BCA");
  const [thermalBag, setThermalBag] = useState(false);

  const basketCount = getBasketCount(basket);
  const basketTotal = getBasketTotal(basket);
  const checkoutTotal = basketTotal + (thermalBag ? thermalBagPrice : 0);
  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    const activeIds = new Set(menuNavGroups.find((group) => group.id === activeGroup)?.itemIds ?? []);
    return menuItems.filter((item) => {
      const groupMatch = activeIds.has(item.id);
      const queryMatch = !search || item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
      return groupMatch && queryMatch;
    });
  }, [activeGroup, query]);

  function openCustomization(item: (typeof menuItems)[number]) {
    setCustomizingItem(item);
    setSelectedSeasonal(seasonalAddOns[0]);
    setSelectedSugar(50);
    setSelectedMilk("Dairy");
    setSelectedIce(iceOptions[1]);
    setSelectedMatchaService(matchaServiceOptions[0]);
  }

  function addCustomizedItem() {
    if (!customizingItem) return;
    setBasket((current) => addConfiguredItem(current, customizingItem, {
      seasonalAddOn: selectedSeasonal,
      sugarLevel: selectedSugar,
      milkOption: selectedMilk,
      iceOption: selectedIce,
      matchaService: selectedMatchaService,
    }));
    setCustomizingItem(null);
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutState("saving");
    setCheckoutMessage("");
    const baseMessage = buildBasketWhatsappMessage({
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      items: basket,
      paymentMethod,
      thermalBag,
    });

    try {
      const savedOrder = await saveOrder({
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        items: basket,
        paymentMethod,
        thermalBag,
        whatsappMessage: baseMessage,
      });
      const whatsappMessage = buildBasketWhatsappMessage({
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        items: basket,
        paymentMethod,
        thermalBag,
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

  const checkoutDisabled = checkoutState === "saving" || basket.length === 0 || customer.name.trim().length < 2 || customer.phone.trim().length < 8 || customer.address.trim().length < 5;

  return (
    <main className="min-h-screen min-w-[320px] bg-[#ebe4d5] px-0 py-0 font-['Source_Sans_3'] text-[#172338] sm:px-5 sm:py-5">
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
                <h1 className="mt-2 max-w-xl font-['Merriweather'] text-4xl font-bold leading-tight sm:text-5xl">Ceremonial matcha, made fresh.</h1>
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
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                className="h-12 w-full rounded-full border border-white/10 bg-[#0d2d26] pl-11 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-white/30"
                placeholder="Search the menu"
                type="search"
                aria-label="Search menu"
              />
            </label>
          </header>

          <div className="rounded-t-lg bg-[#f9f5ea] px-4 pb-8 pt-5 sm:px-7">
            <nav className="grid grid-cols-4 gap-1 pb-4 sm:gap-2" aria-label="Menu highlights">
              {menuNavGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => { setActiveGroup(group.id); setQuery(""); }}
                  className={`min-w-0 rounded-full border px-2 py-3 text-[11px] font-bold transition sm:px-5 sm:text-sm ${activeGroup === group.id ? "border-[#123b31] bg-[#123b31] text-white shadow-lg shadow-emerald-950/10" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
                >
                  {group.label}
                </button>
              ))}
            </nav>

            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-['Merriweather'] text-2xl font-bold">{menuNavGroups.find((group) => group.id === activeGroup)?.label}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{visibleItems.length} menu choices</p>
              </div>
              <span className="rounded-full bg-[#e9dfbd] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5d512f]">Open</span>
            </div>

            <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-4">
              {visibleItems.map((item) => {
                const selectedQuantity = basket.filter((basketItem) => basketItem.id === item.id).reduce((total, basketItem) => total + basketItem.quantity, 0);
                return (
                  <article key={item.id} className="flex h-full flex-col rounded-lg border border-slate-100 bg-white p-3 shadow-lg shadow-emerald-950/5 sm:p-4">
                    <div className="relative grid h-56 min-h-0 place-items-center rounded-md bg-[#f0eadc] p-3 sm:h-64 xl:h-72">
                      {item.badge ? <span className="absolute left-2 top-2 z-10 rounded-full bg-[#123b31] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">{item.badge}</span> : null}
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-[88%] min-h-0 w-auto max-w-full object-contain object-center"
                        onError={(event) => { event.currentTarget.src = logoImage; }}
                      />
                    </div>
                    <div className="px-1 pt-3">
                      <h3 className="font-['Merriweather'] text-sm font-bold leading-snug sm:text-base">{item.name}</h3>
                      <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-500">{item.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <strong className="text-sm sm:text-base">{item.price}</strong>
                      <button
                        type="button"
                        onClick={() => openCustomization(item)}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#123b31] font-bold text-white transition hover:bg-[#185345]"
                        aria-label={`Add ${item.name} to basket`}
                      >
                        {selectedQuantity > 0 ? selectedQuantity : <Plus className="h-5 w-5" />}
                      </button>
                    </div>
                  </article>
                );
              })}
              {visibleItems.length === 0 ? <p className="col-span-full rounded-md border border-dashed border-slate-300 px-4 py-10 text-center text-sm font-semibold text-slate-500">No drinks match that search.</p> : null}
            </div>

            <section className="mt-6 rounded-lg bg-white p-4 shadow-lg shadow-emerald-950/5" aria-label="Full menu board">
              <h2 className="font-['Merriweather'] text-2xl font-bold">Full menu</h2>
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
                <h2 className="mt-1 font-['Merriweather'] text-2xl font-bold">Shopping basket</h2>
              </div>
              <strong className="rounded-full bg-white px-3 py-2 text-sm text-[#123b31]">{formatRupiah(checkoutTotal)}</strong>
            </div>

            <div className="mt-5 space-y-3">
              {basket.length === 0 ? (
                <div className="rounded-md border border-dashed border-white/20 p-5 text-sm font-medium leading-6 text-white/60">Your basket is empty.</div>
              ) : basket.map((item) => (
                <div key={item.lineId} className="grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 rounded-md bg-white/10 p-3">
                  <img src={item.image} alt="" className="h-[54px] w-[54px] rounded-md bg-white/10 object-contain p-1" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <span className="mt-1 block truncate text-[10px] font-semibold text-white/60">{item.seasonalAddOn.id !== "none" ? item.seasonalAddOn.name : "Classic"} · {item.sugarLevel}% · {item.milkOption}</span>
                    <span className="mt-1 block text-xs font-semibold text-white/60">{formatRupiah(item.priceValue * item.quantity)}</span>
                  </div>
                  <div className="flex items-center rounded-full bg-white text-[#123b31]">
                    <button type="button" onClick={() => setBasket((items) => updateQuantity(items, item.lineId, item.quantity - 1))} className="grid h-8 w-8 place-items-center" aria-label={`Remove one ${item.name}`}><Minus className="h-4 w-4" /></button>
                    <strong className="min-w-5 text-center text-xs">{item.quantity}</strong>
                    <button type="button" onClick={() => setBasket((items) => updateQuantity(items, item.lineId, item.quantity + 1))} className="grid h-8 w-8 place-items-center" aria-label={`Add one ${item.name}`}><Plus className="h-4 w-4" /></button>
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
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Address</span>
                <textarea value={customer.address} onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))} className="min-h-20 w-full resize-y rounded-md border border-white/10 bg-white/10 px-4 py-3 font-semibold text-white outline-none placeholder:text-white/30 focus:border-white/30" placeholder="Street, building, area, and any delivery note" required />
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Payment method</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["BCA", "OVO", "GoPay", "SeaBank"] as const).map((method) => (
                  <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`rounded-md border px-3 py-3 text-left text-sm font-bold transition ${paymentMethod === method ? "border-[#f2c46b] bg-[#f2c46b] text-[#123b31]" : "border-white/10 bg-white/10 text-white hover:bg-white/15"}`}>{method}</button>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-white/10 bg-white/10 p-3">
              <span><span className="block text-sm font-bold">Thermal bag</span><span className="mt-1 block text-xs font-semibold text-white/55">Keep your order chilled · +Rp 5.000</span></span>
              <input type="checkbox" checked={thermalBag} onChange={(event) => setThermalBag(event.target.checked)} className="h-5 w-5 accent-[#f2c46b]" aria-label="Add thermal bag" />
            </label>

            <div className="mt-5 overflow-hidden rounded-md bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-[#123b31]"><span className="text-sm font-bold">To be paid</span><strong>{formatRupiah(checkoutTotal)}</strong></div>
              <button type="submit" disabled={checkoutDisabled} className="h-14 w-full bg-[#f2c46b] font-bold text-[#123b31] transition hover:bg-[#f6cf83] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
                {checkoutState === "saving" ? "Saving order..." : "Save and open WhatsApp"}
              </button>
            </div>

            {checkoutMessage ? <p className={`mt-4 rounded-md p-3 text-sm font-semibold ${checkoutState === "error" ? "bg-rose-500/20 text-rose-100" : "bg-white/10 text-white/75"}`}>{checkoutMessage}</p> : null}
          </form>
        </aside>
      </div>

      {customizingItem ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/55 p-0 sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-label={`Customize ${customizingItem.name}`}>
          <form onSubmit={(event) => { event.preventDefault(); addCustomizedItem(); }} className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-[#f9f5ea] p-5 text-[#172338] shadow-2xl sm:max-w-xl sm:rounded-lg sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#708b4f]">Customize your drink</p>
                <h2 className="mt-1 font-['Merriweather'] text-2xl font-bold">{customizingItem.name}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Base price {customizingItem.price}</p>
              </div>
              <button type="button" onClick={() => setCustomizingItem(null)} className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xl text-slate-600" aria-label="Close customization">×</button>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Seasonal add-on</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {seasonalAddOns.map((option) => (
                  <button key={option.id} type="button" onClick={() => setSelectedSeasonal(option)} className={`rounded-md border p-3 text-left transition ${selectedSeasonal.id === option.id ? "border-[#123b31] bg-[#123b31] text-white" : "border-slate-200 bg-white hover:border-slate-400"}`}>
                    <span className="block text-sm font-bold">{option.name}</span>
                    <span className={`mt-1 block text-xs font-semibold ${selectedSeasonal.id === option.id ? "text-white/70" : "text-slate-500"}`}>{option.priceValue ? `+${formatRupiah(option.priceValue)}` : "No add-on"}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Ice option</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {iceOptions.map((option) => (
                  <button key={option.id} type="button" onClick={() => setSelectedIce(option)} className={`rounded-md border px-2 py-3 text-left transition ${selectedIce.id === option.id ? "border-[#123b31] bg-[#123b31] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
                    <span className="block text-xs font-bold sm:text-sm">{option.name}</span>
                    <span className={`mt-1 block text-[10px] font-semibold ${selectedIce.id === option.id ? "text-white/70" : "text-slate-500"}`}>{option.priceValue ? `+${formatRupiah(option.priceValue)}` : "No charge"}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Matcha mini cup</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {matchaServiceOptions.map((option) => (
                  <button key={option.id} type="button" onClick={() => setSelectedMatchaService(option)} className={`rounded-md border p-3 text-left transition ${selectedMatchaService.id === option.id ? "border-[#123b31] bg-[#123b31] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
                    <span className="block text-xs font-bold sm:text-sm">{option.name}</span>
                    <span className={`mt-1 block text-[10px] font-semibold ${selectedMatchaService.id === option.id ? "text-white/70" : "text-slate-500"}`}>{option.priceValue ? `+${formatRupiah(option.priceValue)}` : "No charge"}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Sugar level</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {sugarLevels.map((level) => (
                  <button key={level} type="button" onClick={() => setSelectedSugar(level)} className={`rounded-md border px-3 py-3 text-sm font-bold transition ${selectedSugar === level ? "border-[#123b31] bg-[#123b31] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>{level}%</button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Milk option</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {milkOptions.map((option) => (
                  <button key={option} type="button" onClick={() => setSelectedMilk(option)} className={`rounded-md border px-2 py-3 text-sm font-bold transition ${selectedMilk === option ? "border-[#123b31] bg-[#123b31] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>{option}</button>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
              <div>
                <span className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Price per drink</span>
                <strong className="mt-1 block text-xl">{formatRupiah(customizingItem.priceValue + selectedSeasonal.priceValue + selectedIce.priceValue + selectedMatchaService.priceValue)}</strong>
              </div>
              <button type="submit" className="rounded-md bg-[#123b31] px-5 py-3 font-bold text-white transition hover:bg-[#185345]">Add to basket</button>
            </div>
          </form>
        </div>
      ) : null}

      <footer className="mx-auto mt-6 max-w-7xl rounded-md bg-white px-5 py-5 sm:mb-1">
        <BrandCredit />
      </footer>
    </main>
  );
}
