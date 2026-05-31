export type Role = "ADMIN" | "WORKER";

export type OrderStatus = "PENDING" | "PROSES" | "SELESAI" | "CANCEL";

export interface User {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  game: string;
  orderType: string;
  customerName: string;
  harga: number;
  ownerCut: number;
  workerIncome: number;
  status: OrderStatus;
  note?: string | null;
  workerId?: string | null;
  worker?: { id: string; username: string } | null;
  startDate?: string | null;
  finishDate?: string | null;
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PublicStats {
  totalOrders: number;
  completedOrders: number;
  activeWorkers: number;
  recentOrders: Order[];
}

export interface AdminStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeWorkers: number;
  totalWorkers: number;
}
