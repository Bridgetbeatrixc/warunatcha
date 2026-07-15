import { describe, expect, it } from "vitest";
import { canTransitionOrder, validateOrder } from "../src/orders";

describe("validateOrder", () => {
  it("uses catalog prices instead of client supplied values", () => {
    const result = validateOrder({
      customerName: "Bridget",
      customerPhone: "0812 3456 7890",
      items: [{ id: "og-matcha-latte", name: "Fake", quantity: 2, price: 1 }],
      whatsappMessage: "Order",
    });
    expect("order" in result && result.order.total_amount).toBe(104000);
    expect("order" in result && result.order.items[0].name).toBe("OG Matcha Latte");
  });

  it("rejects unknown products and excessive quantities", () => {
    const base = { customerName: "Bridget", customerPhone: "081234567890" };
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
