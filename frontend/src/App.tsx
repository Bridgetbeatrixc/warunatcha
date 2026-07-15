import { FormEvent, useMemo, useState } from "react";
import { saveOrder } from "./api";
import { addItem, BasketItem, formatRupiah, getBasketCount, getBasketTotal, updateQuantity } from "./basket";
import { buildBasketWhatsappMessage, buildBasketWhatsappUrl } from "./whatsapp";
import { categories, Category, logoImage, menuBoardImage, menuItems } from "./menuData";

type Customer = {
  name: string;
  phone: string;
};

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "" });
  const [checkoutState, setCheckoutState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const basketCount = getBasketCount(basket);
  const basketTotal = getBasketTotal(basket);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
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
        orderId: savedOrder.id,
      });

      setCheckoutState("saved");
      setCheckoutMessage(`Order saved to ${savedOrder.storage}. Opening WhatsApp.`);
      window.open(buildBasketWhatsappUrl(whatsappMessage), "_blank", "noopener,noreferrer");
    } catch (error) {
      setCheckoutState("error");
      setCheckoutMessage(error instanceof Error ? error.message : "Order could not be saved.");
    }
  }

  const checkoutDisabled =
    checkoutState === "saving" || basket.length === 0 || customer.name.trim().length < 2 || customer.phone.trim().length < 8;

  return (
    <main className="app-shell">
      <div className="order-layout">
        <section className="menu-phone">
          <header className="menu-hero">
            <div className="topbar">
              <div className="brand-chip">
                <img src={logoImage} alt="Warunatcha" className="brand-logo" />
                <div>
                  <p className="eyebrow">Pickup order</p>
                  <p className="brand-name">Warunatcha Matcha</p>
                </div>
              </div>

              <button type="button" className="bag-pill" aria-label="Shopping basket">
                <span>BAG</span>
                {basketCount > 0 ? <strong>{basketCount}</strong> : null}
              </button>
            </div>

            <div className="hero-grid">
              <div>
                <p className="eyebrow green">Orders</p>
                <h1>Matcha menu for quick WhatsApp checkout.</h1>
              </div>

              <div className="mini-total">
                <p>Ready basket</p>
                <strong>{formatRupiah(basketTotal)}</strong>
                <span>{basketCount} item selected</span>
              </div>
            </div>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="search-input"
              placeholder="Search for matcha..."
              type="search"
              aria-label="Search menu"
            />
          </header>

          <div className="menu-sheet">
            <nav className="category-tabs" aria-label="Menu categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={activeCategory === category ? "active" : ""}
                >
                  {category}
                </button>
              ))}
            </nav>

            <div className="section-heading">
              <div>
                <h2>{activeCategory === "All" ? "All drinks" : activeCategory}</h2>
                <p>{visibleItems.length} menu choices</p>
              </div>
              <span>Open</span>
            </div>

            <div className="product-grid">
              {visibleItems.map((item) => {
                const selectedQuantity = basket.find((basketItem) => basketItem.id === item.id)?.quantity || 0;

                return (
                  <article className="product-card" key={item.id}>
                    <div className="product-image">
                      {item.badge ? <span>{item.badge}</span> : null}
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = logoImage;
                        }}
                      />
                    </div>

                    <div className="product-copy">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                    </div>

                    <div className="product-footer">
                      <strong>{item.price}</strong>
                      <button
                        type="button"
                        onClick={() => setBasket((currentBasket) => addItem(currentBasket, item))}
                        aria-label={`Add ${item.name} to basket`}
                      >
                        {selectedQuantity > 0 ? selectedQuantity : "+"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <section className="menu-board-panel" aria-label="Full menu board">
              <div>
                <h2>Full menu</h2>
                <p>Classic prices, seasonal powder upgrades, sugar level, and milk options.</p>
              </div>
              <img src={menuBoardImage} alt="Warunatcha full menu with prices and options" loading="lazy" />
            </section>
          </div>
        </section>

        <aside className="checkout-column">
          <form onSubmit={handleCheckout} className="checkout-card">
            <div className="checkout-head">
              <div>
                <p className="eyebrow">Checkout</p>
                <h2>Shopping basket</h2>
              </div>
              <strong>{formatRupiah(basketTotal)}</strong>
            </div>

            <div className="basket-list">
              {basket.length === 0 ? (
                <div className="empty-basket">Add drinks to prepare a WhatsApp order.</div>
              ) : (
                basket.map((item) => (
                  <div className="basket-row" key={item.id}>
                    <img src={item.image} alt="" />
                    <div>
                      <p>{item.name}</p>
                      <span>{formatRupiah(item.priceValue * item.quantity)}</span>
                    </div>
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() => setBasket((items) => updateQuantity(items, item.id, item.quantity - 1))}
                        aria-label={`Remove one ${item.name}`}
                      >
                        -
                      </button>
                      <strong>{item.quantity}</strong>
                      <button
                        type="button"
                        onClick={() => setBasket((items) => updateQuantity(items, item.id, item.quantity + 1))}
                        aria-label={`Add one ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="customer-fields">
              <label>
                <span>Name</span>
                <input
                  value={customer.name}
                  onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Customer name"
                  required
                />
              </label>

              <label>
                <span>Phone number</span>
                <input
                  value={customer.phone}
                  onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  inputMode="tel"
                  required
                />
              </label>
            </div>

            <div className="pay-box">
              <div>
                <span>To be paid</span>
                <strong>{formatRupiah(basketTotal)}</strong>
              </div>
              <button type="submit" disabled={checkoutDisabled}>
                {checkoutState === "saving" ? "Saving order..." : "Save and open WhatsApp"}
              </button>
            </div>

            {checkoutMessage ? <p className={`checkout-message ${checkoutState}`}>{checkoutMessage}</p> : null}
          </form>
        </aside>
      </div>
    </main>
  );
}

export default App;
