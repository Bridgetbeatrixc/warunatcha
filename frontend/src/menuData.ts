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
const fallbackProductImage = asset("Logo optional 3.jpeg");

export const whatsappNumber = "6285959161970";

export const categories: Category[] = ["All", "Matcha", "Special", "Pure Tea"];

export const menuItems: MenuItem[] = [
  {
    id: "og-matcha-latte",
    name: "OG Matcha Latte",
    description: "Ceremonial matcha whisked fresh with creamy milk.",
    price: "Rp 35.000",
    priceValue: 35000,
    category: "Matcha",
    image: asset("OG Matcha Latte.png"),
  },
  {
    id: "earl-grey-matcha",
    name: "Earl Grey Matcha",
    description: "Bright matcha layered with fragrant earl grey tea notes.",
    price: "Rp 38.000",
    priceValue: 38000,
    category: "Special",
    image: asset("Earl Grey Matcha.png"),
    badge: "Signature",
  },
  {
    id: "salted-cream-matcha",
    name: "Salted Cream Matcha",
    description: "A smooth matcha latte topped with soft salted cream.",
    price: "Rp 40.000",
    priceValue: 40000,
    category: "Special",
    image: asset("Salted Cream Matcha.png"),
  },
  {
    id: "biscoff-matcha",
    name: "Biscoff Matcha",
    description: "Matcha latte with biscoff sweetness and a cozy finish.",
    price: "Rp 42.000",
    priceValue: 42000,
    category: "Special",
    image: asset("Biscoff Matcha.png"),
  },
  {
    id: "cold-whisk-matcha",
    name: "Cold Whisk Matcha",
    description: "Fresh cold-whisked matcha for a lighter, clean taste.",
    price: "Rp 35.000",
    priceValue: 35000,
    category: "Pure Tea",
    image: fallbackProductImage,
  },
  {
    id: "peanut-butter-matcha",
    name: "Peanut Butter Matcha",
    description: "Nutty peanut butter balanced with earthy matcha.",
    price: "Rp 42.000",
    priceValue: 42000,
    category: "Special",
    image: asset("Peanut Butter Matcha.png"),
  },
  {
    id: "strawberry-matcha",
    name: "Strawberry Matcha",
    description: "House strawberry layer, milk, and fresh ceremonial matcha.",
    price: "Rp 40.000",
    priceValue: 40000,
    category: "Matcha",
    image: asset("Strawberry Matcha.png"),
    badge: "Favorite",
  },
  {
    id: "usucha",
    name: "Usucha",
    description: "Traditional thin matcha, whisked clean and simple.",
    price: "Rp 32.000",
    priceValue: 32000,
    category: "Pure Tea",
    image: fallbackProductImage,
  },
  {
    id: "cookies-cream-matcha",
    name: "Cookies & Cream Matcha",
    description: "Creamy matcha latte with cookies and cream comfort.",
    price: "Rp 42.000",
    priceValue: 42000,
    category: "Special",
    image: asset("Cookies & Cream Matcha.png"),
  },
];

export const howToOrderImage = asset("How to order method.png");
export const logoImage = asset("Logo main.jpeg");
