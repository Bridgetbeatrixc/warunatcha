export type CatalogItem = { id: string; name: string; price: number };

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
