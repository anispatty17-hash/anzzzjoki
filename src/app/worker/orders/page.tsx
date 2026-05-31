"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const STATUS_OPTIONS = ["ALL", "PENDING", "PROSES", "SELESAI", "CANCEL"] as const;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}
function formatDate(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function WorkerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json() as { success: boolean; data: Order[]; meta: { totalPages: number } };
      if (data.success) { setOrders(data.data); setTotalPages(data.meta.totalPages); }
    } finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string, extraData?: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note: note || undefined, ...extraData }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) { setSelected(null); setNote(""); void fetchOrders(); }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Orders</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Order yang bisa Anda ambil dan kelola</p>
      </div>

      <div className="card p-4">
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                status === s ? "bg-[#2563EB] text-white" : "bg-white/5 text-[#94A3B8] hover:text-white hover:bg-white/10"
              }`}
            >
              {s === "ALL" ? "Semua" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[#94A3B8] border-b border-white/5">
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Game</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Tipe</th>
                    <th className="px-6 py-3 font-medium">Penghasilan</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Tanggal</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-16 text-center text-[#94A3B8]">Tidak ada order</td></tr>
                  ) : orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-[#F8FAFC] font-medium text-sm">{o.customerName}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm">{o.game}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm hidden md:table-cell">{o.orderType}</td>
                      <td className="px-6 py-4 text-[#F8FAFC] font-medium text-sm">{formatCurrency(o.workerIncome)}</td>
                      <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm hidden md:table-cell">{formatDate(o.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setSelected(o); setNote(o.note ?? ""); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center p-4 border-t border-white/5">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setNote(""); }} title="Detail Order" size="md">
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Customer", value: selected.customerName },
                { label: "Game", value: selected.game },
                { label: "Tipe Order", value: selected.orderType },
                { label: "Status", value: <StatusBadge status={selected.status} /> },
                { label: "Penghasilan", value: formatCurrency(selected.workerIncome) },
                { label: "Harga Total", value: formatCurrency(selected.harga) },
                { label: "Mulai", value: formatDate(selected.startDate) },
                { label: "Selesai", value: formatDate(selected.finishDate) },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-[#94A3B8] text-xs mb-1">{row.label}</p>
                  <div className="text-[#F8FAFC] text-sm font-medium">{row.value}</div>
                </div>
              ))}
            </div>
            {selected.note && (
              <div>
                <p className="text-[#94A3B8] text-xs mb-1">Catatan</p>
                <p className="text-[#F8FAFC] text-sm bg-white/5 rounded-xl p-3">{selected.note}</p>
              </div>
            )}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-2">Catatan Anda</label>
              <textarea
                className="input resize-none text-sm"
                rows={2}
                placeholder="Tambah catatan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              {selected.status === "PENDING" && !selected.workerId && (
                <button
                  onClick={() => updateStatus(selected.id, "PROSES")}
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? "Memproses..." : "Ambil Order"}
                </button>
              )}
              {selected.status === "PROSES" && (
                <>
                  <button
                    onClick={() => updateStatus(selected.id, "SELESAI")}
                    disabled={submitting}
                    className="btn-success flex-1"
                  >
                    {submitting ? "Menyimpan..." : "Tandai Selesai"}
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "CANCEL")}
                    disabled={submitting}
                    className="btn-danger"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button onClick={() => { setSelected(null); setNote(""); }} className="btn-secondary">
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
