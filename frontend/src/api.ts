import { BasketItem } from "./basket";

const apiUrl = import.meta.env.VITE_API_URL || "https://warunatcha-api.bbeatrix.workers.dev";

export type OrderPayload = {
  customerName: string;
  customerPhone: string;
  items: BasketItem[];
  whatsappMessage: string;
  paymentMethod: "BCA" | "OVO" | "GoPay" | "SeaBank";
};

export async function saveOrder(payload: OrderPayload) {
  const response = await fetch(`${apiUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      whatsappMessage: payload.whatsappMessage,
      paymentMethod: payload.paymentMethod,
      items: payload.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.priceValue,
        seasonalAddOnId: item.seasonalAddOn.id,
        sugarLevel: item.sugarLevel,
        milkOption: item.milkOption,
        iceOptionId: item.iceOption.id,
        matchaServiceId: item.matchaService.id,
      })),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Order could not be saved.");
  }

  return data as { id: string; orderNumber: number; storage: "supabase" };
}
