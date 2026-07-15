import { MenuItem, MilkOption, SeasonalAddOn, SugarLevel } from "./menuData";

export type BasketItem = Pick<MenuItem, "id" | "name" | "price" | "priceValue" | "image"> & {
  quantity: number;
  lineId: string;
  seasonalAddOn: SeasonalAddOn;
  sugarLevel: SugarLevel;
  milkOption: MilkOption;
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
  return addConfiguredItem(items, item, {
    seasonalAddOn: { id: "none", name: "No seasonal add-on", priceValue: 0 },
    sugarLevel: 50,
    milkOption: "Dairy",
  });
}

export function addConfiguredItem(
  items: BasketItem[],
  item: MenuItem,
  configuration: { seasonalAddOn: SeasonalAddOn; sugarLevel: SugarLevel; milkOption: MilkOption },
) {
  const lineId = [item.id, configuration.seasonalAddOn.id, configuration.sugarLevel, configuration.milkOption].join("-").toLowerCase();
  const existing = items.find((basketItem) => basketItem.lineId === lineId);
  const configuredPriceValue = item.priceValue + configuration.seasonalAddOn.priceValue;

  if (existing) {
    return items.map((basketItem) =>
      basketItem.lineId === lineId ? { ...basketItem, quantity: basketItem.quantity + 1 } : basketItem,
    );
  }

  return [
    ...items,
    {
      id: item.id,
      lineId,
      image: item.image,
      name: item.name,
      price: formatRupiah(configuredPriceValue),
      priceValue: configuredPriceValue,
      quantity: 1,
      seasonalAddOn: configuration.seasonalAddOn,
      sugarLevel: configuration.sugarLevel,
      milkOption: configuration.milkOption,
    },
  ];
}

export function updateQuantity(items: BasketItem[], lineId: string, quantity: number) {
  if (quantity <= 0) {
    return items.filter((item) => item.lineId !== lineId);
  }

  return items.map((item) => (item.lineId === lineId ? { ...item, quantity } : item));
}
