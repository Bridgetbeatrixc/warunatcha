import { catalogById, iceOptionById, matchaServiceById, milkOptions, seasonalAddOnById, sugarLevels } from "./catalog";

export const orderStatuses = ["new", "preparing", "finished", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export const paymentMethods = ["BCA", "OVO", "GoPay", "SeaBank"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];
export const paymentStatuses = ["unpaid", "paid"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export type SafeOrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options: { seasonalAddOn: string; sugarLevel: number; milkOption: string; iceOption: string; matchaService: string };
};
export type NewOrder = {
  customer_name: string;
  customer_phone: string;
  items: SafeOrderItem[];
  total_amount: number;
  whatsapp_message: string;
  status: "new";
  payment_method: PaymentMethod;
  payment_status: "unpaid";
  packaging_amount: number;
};

type ValidationResult = { order: NewOrder } | { error: string };

export function validateOrder(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object") return { error: "Invalid order payload." };

  const input = payload as Record<string, unknown>;
  const customerName = String(input.customerName ?? "").trim();
  const customerPhone = String(input.customerPhone ?? "").replace(/[^\d+]/g, "");
  const requestedItems = Array.isArray(input.items) ? input.items : [];
  const whatsappMessage = String(input.whatsappMessage ?? "").trim().slice(0, 4000);
  const paymentMethod = String(input.paymentMethod ?? "");
  const thermalBag = input.thermalBag === true;

  if (customerName.length < 2 || customerName.length > 100) {
    return { error: "Customer name must be between 2 and 100 characters." };
  }
  if (customerPhone.length < 8 || customerPhone.length > 20) {
    return { error: "Valid phone number is required." };
  }
  if (requestedItems.length === 0 || requestedItems.length > 20) {
    return { error: "Basket must contain between 1 and 20 menu items." };
  }
  if (!paymentMethods.includes(paymentMethod as PaymentMethod)) return { error: "Select a valid payment method." };

  const items: SafeOrderItem[] = [];
  for (const rawItem of requestedItems) {
    if (!rawItem || typeof rawItem !== "object") return { error: "Basket contains an invalid item." };
    const inputItem = rawItem as Record<string, unknown>;
    const catalogItem = catalogById.get(String(inputItem.id ?? ""));
    const quantity = Number(inputItem.quantity);
    const seasonalAddOn = seasonalAddOnById.get(String(inputItem.seasonalAddOnId ?? "none"));
    const sugarLevel = Number(inputItem.sugarLevel ?? 50);
    const milkOption = String(inputItem.milkOption ?? "Dairy");
    const iceOption = iceOptionById.get(String(inputItem.iceOptionId ?? "ice-gabung"));
    const matchaService = matchaServiceById.get(String(inputItem.matchaServiceId ?? "matcha-gabung"));
    if (!catalogItem) return { error: "Basket contains an unknown menu item." };
    if (!seasonalAddOn) return { error: "Basket contains an unknown seasonal add-on." };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return { error: "Item quantity must be between 1 and 20." };
    }
    if (!sugarLevels.includes(sugarLevel as (typeof sugarLevels)[number])) return { error: "Invalid sugar level." };
    if (!milkOptions.includes(milkOption as (typeof milkOptions)[number])) return { error: "Invalid milk option." };
    if (!iceOption) return { error: "Invalid ice option." };
    if (!matchaService) return { error: "Invalid matcha mini cup option." };
    items.push({
      id: catalogItem.id,
      name: catalogItem.name,
      quantity,
      price: catalogItem.price + seasonalAddOn.price + iceOption.price + matchaService.price,
      options: { seasonalAddOn: seasonalAddOn.name, sugarLevel, milkOption, iceOption: iceOption.name, matchaService: matchaService.name },
    });
  }

  return {
    order: {
      customer_name: customerName,
      customer_phone: customerPhone,
      items,
      total_amount: items.reduce((total, item) => total + item.price * item.quantity, 0) + (thermalBag ? 5000 : 0),
      whatsapp_message: whatsappMessage,
      status: "new",
      payment_method: paymentMethod as PaymentMethod,
      payment_status: "unpaid",
      packaging_amount: thermalBag ? 5000 : 0,
    },
  };
}

export function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.includes(value as OrderStatus);
}

export function canTransitionOrder(current: OrderStatus, next: OrderStatus) {
  if (current === "new") return next === "preparing" || next === "finished" || next === "cancelled";
  if (current === "preparing") return next === "finished" || next === "cancelled";
  return false;
}
