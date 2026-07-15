export type CatalogItem = { id: string; name: string; price: number };
export type SeasonalAddOn = { id: string; name: string; price: number };

export const catalog: CatalogItem[] = [
  { id: "og-matcha-latte", name: "OG Matcha Latte", price: 52000 },
  { id: "earl-grey-matcha", name: "Earl Grey Matcha", price: 58000 },
  { id: "salted-cream-matcha", name: "Salted Cream Matcha", price: 60000 },
  { id: "biscoff-matcha", name: "Biscoff Matcha", price: 72000 },
  { id: "cold-whisk-matcha", name: "Cold Whisk Matcha", price: 55000 },
  { id: "peanut-butter-matcha", name: "Peanut Butter Matcha", price: 57000 },
  { id: "strawberry-matcha", name: "Strawberry Matcha", price: 58000 },
  { id: "usucha", name: "Usucha", price: 45000 },
  { id: "cookies-cream-matcha", name: "Cookies & Cream Matcha", price: 58000 },
];

export const catalogById = new Map(catalog.map((item) => [item.id, item]));

export const seasonalAddOns: SeasonalAddOn[] = [
  { id: "none", name: "No seasonal add-on", price: 0 },
  { id: "isuzu", name: "Isuzu", price: 25000 },
  { id: "chawa", name: "Chawa", price: 18000 },
  { id: "nami", name: "Nami", price: 22000 },
  { id: "fujinoshiro", name: "Fujinoshiro", price: 18000 },
  { id: "hatsu", name: "Hatsu", price: 11000 },
  { id: "aoarashi", name: "Aoarashi", price: 22000 },
  { id: "uji", name: "Uji", price: 15000 },
  { id: "wakatake", name: "Wakatake", price: 14000 },
  { id: "samidori", name: "Samidori", price: 23000 },
  { id: "yame", name: "Yame", price: 25000 },
  { id: "kikuju", name: "Kikuju", price: 25000 },
  { id: "kanbayashi", name: "Kanbayashi", price: 14000 },
];

export const seasonalAddOnById = new Map(seasonalAddOns.map((item) => [item.id, item]));
export const sugarLevels = [0, 25, 50] as const;
export const milkOptions = ["Dairy", "Oat", "Houseblend"] as const;
