export type Category = "All" | "Matcha" | "Special" | "Pure Tea";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  category: Exclude<Category, "All">;
  image: string;
  badge?: string;
};

export type SeasonalAddOn = {
  id: string;
  name: string;
  priceValue: number;
};

export type SugarLevel = 0 | 25 | 50;
export type MilkOption = "Dairy" | "Oat" | "Houseblend";

const asset = (fileName: string) => `/assets/${encodeURIComponent(fileName)}`;
const productAsset = (fileName: string) => `${asset(fileName)}?v=2`;
const fallbackProductImage = asset("Logo no background.PNG");

export const whatsappNumber = "6285959161970";

export const categories: Category[] = ["All", "Matcha", "Special", "Pure Tea"];

export const seasonalAddOns: SeasonalAddOn[] = [
  { id: "none", name: "No seasonal add-on", priceValue: 0 },
  { id: "isuzu", name: "Isuzu", priceValue: 25000 },
  { id: "chawa", name: "Chawa", priceValue: 18000 },
  { id: "nami", name: "Nami", priceValue: 22000 },
  { id: "fujinoshiro", name: "Fujinoshiro", priceValue: 18000 },
  { id: "hatsu", name: "Hatsu", priceValue: 11000 },
  { id: "aoarashi", name: "Aoarashi", priceValue: 22000 },
  { id: "uji", name: "Uji", priceValue: 15000 },
  { id: "wakatake", name: "Wakatake", priceValue: 14000 },
  { id: "samidori", name: "Samidori", priceValue: 23000 },
  { id: "yame", name: "Yame", priceValue: 25000 },
  { id: "kikuju", name: "Kikuju", priceValue: 25000 },
  { id: "kanbayashi", name: "Kanbayashi", priceValue: 14000 },
];

export const sugarLevels: SugarLevel[] = [0, 25, 50];
export const milkOptions: MilkOption[] = ["Dairy", "Oat", "Houseblend"];

export const menuItems: MenuItem[] = [
  {
    id: "og-matcha-latte",
    name: "OG Matcha Latte",
    description: "Classic ceremonial matcha latte with your choice of milk and sugar level.",
    price: "Rp 52.000",
    priceValue: 52000,
    category: "Matcha",
    image: productAsset("OG Matcha Latte.png"),
  },
  {
    id: "earl-grey-matcha",
    name: "Earl Grey Matcha",
    description: "Fragrant earl grey tea layered with smooth matcha and creamy milk.",
    price: "Rp 58.000",
    priceValue: 58000,
    category: "Special",
    image: productAsset("Earl Grey Matcha.png"),
    badge: "Signature",
  },
  {
    id: "salted-cream-matcha",
    name: "Salted Cream Matcha",
    description: "Classic matcha finished with a rich salted cream top.",
    price: "Rp 60.000",
    priceValue: 60000,
    category: "Special",
    image: productAsset("Salted Cream Matcha.png"),
  },
  {
    id: "biscoff-matcha",
    name: "Biscoff Matcha",
    description: "Premium matcha latte with biscoff spread and crunchy biscoff topping.",
    price: "Rp 72.000",
    priceValue: 72000,
    category: "Special",
    image: productAsset("Biscoff Matcha.png"),
  },
  {
    id: "cold-whisk-matcha",
    name: "Cold Whisk Matcha",
    description: "Cold-whisked ceremonial matcha with a clean, bold tea-forward profile.",
    price: "Rp 55.000",
    priceValue: 55000,
    category: "Pure Tea",
    image: productAsset("Cold Whisk Matcha.png"),
  },
  {
    id: "peanut-butter-matcha",
    name: "Peanut Butter Matcha",
    description: "Creamy peanut butter matched with earthy ceremonial matcha.",
    price: "Rp 57.000",
    priceValue: 57000,
    category: "Special",
    image: productAsset("Peanut Butter Matcha.png"),
  },
  {
    id: "strawberry-matcha",
    name: "Strawberry Matcha",
    description: "Strawberry layer, milk, and fresh matcha for a fruity classic.",
    price: "Rp 58.000",
    priceValue: 58000,
    category: "Matcha",
    image: productAsset("Strawberry Matcha.png"),
    badge: "Favorite",
  },
  {
    id: "usucha",
    name: "Usucha",
    description: "Traditional thin matcha, whisked simply with water.",
    price: "Rp 45.000",
    priceValue: 45000,
    category: "Pure Tea",
    image: productAsset("usucha.png"),
  },
  {
    id: "cookies-cream-matcha",
    name: "Cookies & Cream Matcha",
    description: "Creamy matcha latte with cookies and cream sweetness.",
    price: "Rp 58.000",
    priceValue: 58000,
    category: "Special",
    image: productAsset("Cookies & Cream Matcha.png"),
  },
];

export const howToOrderImage = asset("How to order method.png");
export const logoImage = asset("Logo main.png");
export const menuBoardImage = asset("menu.png");
export const growlaneLogoImage = asset("Growlane AI.png");
