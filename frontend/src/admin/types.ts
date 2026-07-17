export type OrderStatus = "new" | "preparing" | "finished" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type PaymentMethod = "BCA" | "OVO" | "GoPay" | "SeaBank";

export type AdminOrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options?: {
    seasonalAddOn: string;
    sugarLevel: number;
    milkOption: string;
    iceOption: string;
    matchaService: string;
  };
};

export type AdminOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  items: AdminOrderItem[];
  total_amount: number;
  packaging_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
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
