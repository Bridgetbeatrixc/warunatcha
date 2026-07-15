export type OrderStatus = "new" | "preparing" | "finished" | "cancelled";

export type AdminOrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type AdminOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  items: AdminOrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
  cancelled_at: string | null;
};

export type OrderSummary = {
  total: number;
  new: number;
  preparing: number;
  finished: number;
  cancelled: number;
  revenue: number;
};
