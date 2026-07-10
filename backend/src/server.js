import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5174";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const localOrdersPath = path.join(dataDir, "orders.json");

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: "100kb" }));

function cleanPhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function validateOrder(payload) {
  const customerName = String(payload.customerName || "").trim();
  const customerPhone = cleanPhone(payload.customerPhone);
  const items = Array.isArray(payload.items) ? payload.items : [];
  const whatsappMessage = String(payload.whatsappMessage || "").trim();

  if (customerName.length < 2) {
    return { error: "Customer name is required." };
  }

  if (customerPhone.length < 8) {
    return { error: "Valid phone number is required." };
  }

  if (items.length === 0) {
    return { error: "Basket is empty." };
  }

  const safeItems = items.map((item) => ({
    id: String(item.id || ""),
    name: String(item.name || ""),
    quantity: Math.max(1, Number(item.quantity || 1)),
    price: Math.max(0, Number(item.price || 0)),
  }));

  if (safeItems.some((item) => !item.id || !item.name)) {
    return { error: "Basket contains an invalid item." };
  }

  const totalAmount = safeItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    order: {
      customer_name: customerName,
      customer_phone: customerPhone,
      items: safeItems,
      total_amount: totalAmount,
      whatsapp_message: whatsappMessage,
      status: "new",
    },
  };
}

async function saveLocalOrder(order) {
  await mkdir(dataDir, { recursive: true });

  let existing = [];
  try {
    existing = JSON.parse(await readFile(localOrdersPath, "utf8"));
  } catch {
    existing = [];
  }

  const savedOrder = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ...order,
  };

  existing.unshift(savedOrder);
  await writeFile(localOrdersPath, JSON.stringify(existing, null, 2));
  return savedOrder;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, storage: supabase ? "supabase" : "local" });
});

app.post("/api/orders", async (req, res) => {
  const validation = validateOrder(req.body || {});

  if (validation.error) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    if (supabase) {
      const { data, error } = await supabase.from("orders").insert(validation.order).select("id").single();

      if (error) {
        throw error;
      }

      res.status(201).json({ id: data.id, storage: "supabase" });
      return;
    }

    const savedOrder = await saveLocalOrder(validation.order);
    res.status(201).json({ id: savedOrder.id, storage: "local" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Order could not be saved." });
  }
});

app.listen(port, () => {
  console.log(`Warunatcha backend listening on http://localhost:${port}`);
});
