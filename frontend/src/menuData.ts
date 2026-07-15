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

const asset = (fileName: string) => `/assets/${encodeURIComponent(fileName)}`;
const fallbackProductImage = asset("Logo no background.PNG");

export const whatsappNumber = "6285959161970";

export const categories: Category[] = ["All", "Matcha", "Special", "Pure Tea"];

export const menuItems: MenuItem[] = [
  {
    id: "og-matcha-latte",
    name: "OG Matcha Latte",
    description: "Classic ceremonial matcha latte with your choice of milk and sugar level.",
    price: "Rp 52.000",
    priceValue: 52000,
    category: "Matcha",
    image: asset("OG Matcha Latte.png"),
  },
  {
    id: "earl-grey-matcha",
    name: "Earl Grey Matcha",
    description: "Fragrant earl grey tea layered with smooth matcha and creamy milk.",
    price: "Rp 58.000",
    priceValue: 58000,
    category: "Special",
    image: asset("Earl Grey Matcha.png"),
    badge: "Signature",
  },
  {
    id: "salted-cream-matcha",
    name: "Salted Cream Matcha",
    description: "Classic matcha finished with a rich salted cream top.",
    price: "Rp 60.000",
    priceValue: 60000,
    category: "Special",
    image: asset("Salted Cream Matcha.png"),
  },
  {
    id: "biscoff-matcha",
    name: "Biscoff Matcha",
    description: "Premium matcha latte with biscoff spread and crunchy biscoff topping.",
    price: "Rp 72.000",
    priceValue: 72000,
    category: "Special",
    image: asset("Biscoff Matcha.png"),
  },
  {
    id: "cold-whisk-matcha",
    name: "Cold Whisk Matcha",
    description: "Cold-whisked ceremonial matcha with a clean, bold tea-forward profile.",
    price: "Rp 55.000",
    priceValue: 55000,
    category: "Pure Tea",
    image: asset("Cold Whisk Matcha.png"),
  },
  {
    id: "peanut-butter-matcha",
    name: "Peanut Butter Matcha",
    description: "Creamy peanut butter matched with earthy ceremonial matcha.",
    price: "Rp 57.000",
    priceValue: 57000,
    category: "Special",
    image: asset("Peanut Butter Matcha.png"),
  },
  {
    id: "strawberry-matcha",
    name: "Strawberry Matcha",
    description: "Strawberry layer, milk, and fresh matcha for a fruity classic.",
    price: "Rp 58.000",
    priceValue: 58000,
    category: "Matcha",
    image: asset("Strawberry Matcha.png"),
    badge: "Favorite",
  },
  {
    id: "usucha",
    name: "Usucha",
    description: "Traditional thin matcha, whisked simply with water.",
    price: "Rp 45.000",
    priceValue: 45000,
    category: "Pure Tea",
    image: asset("usucha.png"),
  },
  {
    id: "cookies-cream-matcha",
    name: "Cookies & Cream Matcha",
    description: "Creamy matcha latte with cookies and cream sweetness.",
    price: "Rp 58.000",
    priceValue: 58000,
    category: "Special",
    image: asset("Cookies & Cream Matcha.png"),
  },
];

export const howToOrderImage = asset("How to order method.png");
export const logoImage = asset("Logo main.png");
export const menuBoardImage = asset("menu.png");
