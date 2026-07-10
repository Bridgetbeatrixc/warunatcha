import { BasketItem, formatRupiah, getBasketTotal } from "./basket";
import { MenuItem, whatsappNumber } from "./menuData";

export function buildWhatsappUrl(item: MenuItem) {
  const lines = [
    `Hello, I would like to order: ${item.name}.`,
    item.price ? `Price: ${item.price}` : "",
    "Please confirm availability and total payment.",
  ].filter(Boolean);

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildBasketWhatsappMessage(params: {
  customerName: string;
  customerPhone: string;
  items: BasketItem[];
  orderId?: string;
}) {
  const itemLines = params.items.map(
    (item, index) =>
      `${index + 1}. ${item.name} x${item.quantity} - ${formatRupiah(item.priceValue * item.quantity)}`,
  );

  return [
    "Hello Warunatcha, I would like to order:",
    "",
    ...itemLines,
    "",
    `Total: ${formatRupiah(getBasketTotal(params.items))}`,
    "",
    `Name: ${params.customerName}`,
    `Phone: ${params.customerPhone}`,
    params.orderId ? `Order ID: ${params.orderId}` : "",
    "",
    "Please confirm availability and payment details. Thank you.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function buildBasketWhatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
