import type { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "badge-pending" },
  PROSES: { label: "Proses", className: "badge-proses" },
  SELESAI: { label: "Selesai", className: "badge-selesai" },
  CANCEL: { label: "Cancel", className: "badge-cancel" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "badge-pending" };
  return <span className={config.className}>{config.label}</span>;
}
