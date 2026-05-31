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

interface OrderFormData {
  game: string;
  orderType: string;
  customerName: string;
  harga: string;
  ownerCut: string;
  workerIncome: string;
  note: string;
  workerId: string;
}

const emptyForm: OrderFormData = { game: "", orderType: "", customerName: "", harga: "", ownerCut: "", workerIncome: "", note: "", workerId: "" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Order | null>(null);
  const [showDelete, setShowDelete] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [workers, setWorkers] = useState<{ id: string; username: string }[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status !== "ALL") params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json() as { success: boolean; data: Order[]; meta: { totalPages: number } };
      if (data.success) { setOrders(data.data); setTotalPages(data.meta.totalPages); }
    } finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const fetchWorkers = async () => {
      const res = await fetch("/api/workers");
      const data = await res.json() as { success: boolean; data: { id: string; username: string }[] };
      if (data.success) setWorkers(data.data);
    };
    void fetchWorkers();
  }, []);

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, harga: Number(form.harga), ownerCut: Number(form.ownerCut), workerIncome: Number(form.workerIncome) }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) { setShowAdd(false); setForm(emptyForm); void fetchOrders(); }
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!showEdit) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${showEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, harga: Number(form.harga), ownerCut: Number(form.ownerCut), workerIncome: Number(form.workerIncome) }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) { setShowEdit(null); void fetchOrders(); }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    setSubmitting(true);
    try {
      await fetch(`/api/orders/${showDelete.id}`, { method: "DELETE" });
      setShowDelete(null);
      void fetchOrders();
    } finally { setSubmitting(false); }
  };

  const openEdit = (o: Order) => {
    setForm({
      game: o.game, orderType: o.orderType, customerName: o.customerName,
      harga: String(o.harga), ownerCut: String(o.ownerCut), workerIncome: String(o.workerIncome),
      note: o.note ?? "", workerId: o.workerId ?? "",
    });
    setShowEdit(o);
  };

  const handleExport = async () => {
    const res = await fetch("/api/admin/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "anzzzjoki-orders.xlsx"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Orders</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Kelola semua pesanan</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true); }} className="btn-primary text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Order
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="input pl-10"
              placeholder="Cari customer, game, tipe..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
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
                    <th className="px-6 py-3 font-medium hidden lg:table-cell">Harga</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Worker</th>
                    <th className="px-6 py-3 font-medium hidden lg:table-cell">Tanggal</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-16 text-center text-[#94A3B8]">Tidak ada order ditemukan</td></tr>
                  ) : orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-[#F8FAFC] font-medium text-sm">{o.customerName}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm">{o.game}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm hidden md:table-cell">{o.orderType}</td>
                      <td className="px-6 py-4 text-[#F8FAFC] text-sm hidden lg:table-cell">{formatCurrency(o.harga)}</td>
                      <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm hidden md:table-cell">{o.worker?.username ?? "-"}</td>
                      <td className="px-6 py-4 text-[#94A3B8] text-sm hidden lg:table-cell">{formatDate(o.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setShowDelete(o)} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Tambah Order" size="lg">
        <OrderForm form={form} setForm={setForm} workers={workers} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} submitting={submitting} />
      </Modal>

      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Order" size="lg">
        <OrderForm form={form} setForm={setForm} workers={workers} onSubmit={handleEdit} onCancel={() => setShowEdit(null)} submitting={submitting} editMode />
      </Modal>

      <Modal isOpen={!!showDelete} onClose={() => setShowDelete(null)} title="Hapus Order" size="sm">
        <div className="space-y-4">
          <p className="text-[#94A3B8]">Yakin ingin menghapus order <span className="text-white font-medium">{showDelete?.customerName}</span>? Aksi ini tidak bisa dibatalkan.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowDelete(null)} className="btn-secondary">Batal</button>
            <button onClick={handleDelete} disabled={submitting} className="btn-danger">{submitting ? "Menghapus..." : "Hapus"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function OrderForm({ form, setForm, workers, onSubmit, onCancel, submitting, editMode }: {
  form: OrderFormData;
  setForm: (f: OrderFormData) => void;
  workers: { id: string; username: string }[];
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  editMode?: boolean;
}) {
  const f = (key: keyof OrderFormData, val: string) => setForm({ ...form, [key]: val });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Nama Customer *</label>
          <input className="input" placeholder="Nama customer" value={form.customerName} onChange={(e) => f("customerName", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Game *</label>
          <input className="input" placeholder="Mobile Legends" value={form.game} onChange={(e) => f("game", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Tipe Order *</label>
          <input className="input" placeholder="Push Rank Mythic" value={form.orderType} onChange={(e) => f("orderType", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Harga (Rp) *</label>
          <input className="input" type="number" placeholder="50000" value={form.harga} onChange={(e) => f("harga", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Bagian Owner (Rp)</label>
          <input className="input" type="number" placeholder="20000" value={form.ownerCut} onChange={(e) => f("ownerCut", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Bagian Worker (Rp)</label>
          <input className="input" type="number" placeholder="30000" value={form.workerIncome} onChange={(e) => f("workerIncome", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Assign Worker (opsional)</label>
        <select className="input" value={form.workerId} onChange={(e) => f("workerId", e.target.value)}>
          <option value="">- Tidak di-assign -</option>
          {workers.map((w) => <option key={w.id} value={w.id}>{w.username}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Catatan</label>
        <textarea className="input resize-none" rows={3} placeholder="Catatan tambahan..." value={form.note} onChange={(e) => f("note", e.target.value)} />
      </div>
      {editMode && (
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">Status</label>
          <select className="input" value={(form as unknown as Record<string, string>).status ?? "PENDING"} onChange={(e) => setForm({ ...form, ...{ status: e.target.value } } as OrderFormData)}>
            {["PENDING","PROSES","SELESAI","CANCEL"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onCancel} className="btn-secondary">Batal</button>
        <button onClick={onSubmit} disabled={submitting} className="btn-primary">
          {submitting ? "Menyimpan..." : editMode ? "Simpan Perubahan" : "Tambah Order"}
        </button>
      </div>
    </div>
  );
}
