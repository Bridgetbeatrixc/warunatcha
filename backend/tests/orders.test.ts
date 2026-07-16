import { describe, expect, it } from "vitest";
import { canTransitionOrder, validateOrder } from "../src/orders";

describe("validateOrder", () => {
  it("uses catalog prices instead of client supplied values", () => {
    const result = validateOrder({
      customerName: "Bridget",
      customerPhone: "0812 3456 7890",
      items: [{ id: "og-matcha-latte", name: "Fake", quantity: 2, price: 1 }],
      whatsappMessage: "Order",
      paymentMethod: "BCA",
    });
    expect("order" in result && result.order.total_amount).toBe(104000);
    expect("order" in result && result.order.items[0].name).toBe("OG Matcha Latte");
  });

  it("validates seasonal add-ons and drink options", () => {
    const result = validateOrder({
      customerName: "Bridget",
      customerPhone: "081234567890",
      items: [{ id: "og-matcha-latte", quantity: 1, seasonalAddOnId: "isuzu", sugarLevel: 0, milkOption: "Oat" }],
      paymentMethod: "OVO",
    });

    expect("order" in result && result.order.total_amount).toBe(77000);
    expect("order" in result && result.order.items[0].options).toEqual({
      seasonalAddOn: "Isuzu",
      sugarLevel: 0,
      milkOption: "Oat",
      iceOption: "Ice gabung",
      matchaService: "Matcha digabung",
    });
  });

  it("adds mini-cup and separated-ice charges to the official total", () => {
    const result = validateOrder({
      customerName: "Bridget",
      customerPhone: "081234567890",
      items: [{ id: "og-matcha-latte", quantity: 1, iceOptionId: "ice-pisah", matchaServiceId: "matcha-mini-cup" }],
      paymentMethod: "SeaBank",
    });

    expect("order" in result && result.order.total_amount).toBe(53020);
    expect("order" in result && result.order.items[0].options.iceOption).toBe("Ice pisah");
    expect("order" in result && result.order.items[0].options.matchaService).toBe("Matcha dipisah (mini cup)");
  });

  it("rejects unknown products and excessive quantities", () => {
    const base = { customerName: "Bridget", customerPhone: "081234567890", paymentMethod: "BCA" };
    const unknown = validateOrder({ ...base, items: [{ id: "unknown", quantity: 1 }] });
    const excessive = validateOrder({ ...base, items: [{ id: "usucha", quantity: 21 }] });
    expect("error" in unknown && unknown.error).toContain("unknown");
    expect("error" in excessive && excessive.error).toContain("quantity");
  });
});

describe("canTransitionOrder", () => {
  it("allows active transitions and locks terminal states", () => {
    expect(canTransitionOrder("new", "preparing")).toBe(true);
    expect(canTransitionOrder("new", "finished")).toBe(true);
    expect(canTransitionOrder("preparing", "cancelled")).toBe(true);
    expect(canTransitionOrder("finished", "new")).toBe(false);
    expect(canTransitionOrder("cancelled", "preparing")).toBe(false);
  });
});
