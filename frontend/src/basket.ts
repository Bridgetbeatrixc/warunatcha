import { MenuItem } from "./menuData";

export type BasketItem = Pick<MenuItem, "id" | "name" | "price" | "priceValue" | "image"> & {
  quantity: number;
};

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, " ");
}

export function getBasketTotal(items: BasketItem[]) {
  return items.reduce((total, item) => total + item.priceValue * item.quantity, 0);
}

export function getBasketCount(items: BasketItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function addItem(items: BasketItem[], item: MenuItem): BasketItem[] {
  const existing = items.find((basketItem) => basketItem.id === item.id);

  if (existing) {
    return items.map((basketItem) =>
      basketItem.id === item.id ? { ...basketItem, quantity: basketItem.quantity + 1 } : basketItem,
    );
  }

  return [
    ...items,
    {
      id: item.id,
      image: item.image,
      name: item.name,
      price: item.price,
      priceValue: item.priceValue,
      quantity: 1,
    },
  ];
}

export function updateQuantity(items: BasketItem[], itemId: string, quantity: number) {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== itemId);
  }

  return items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
}
