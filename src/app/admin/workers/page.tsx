"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/LoadingSpinner";

interface Worker {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState<Worker | null>(null);
  const [showToggle, setShowToggle] = useState<Worker | null>(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/workers");
    const data = await res.json() as { success: boolean; data: Worker[] };
    if (data.success) setWorkers(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchWorkers(); }, [fetchWorkers]);

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) { setShowAdd(false); setForm({ username: "", password: "" }); void fetchWorkers(); }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    setSubmitting(true);
    try {
      await fetch(`/api/workers/${showDelete.id}`, { method: "DELETE" });
      setShowDelete(null);
      void fetchWorkers();
    } finally { setSubmitting(false); }
  };

  const handleToggle = async () => {
    if (!showToggle) return;
    setSubmitting(true);
    try {
      await fetch(`/api/workers/${showToggle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !showToggle.isActive }),
      });
      setShowToggle(null);
      void fetchWorkers();
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Workers</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Kelola akun worker</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Worker
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#94A3B8] border-b border-white/5">
                  <th className="px-6 py-3 font-medium">Username</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Total Order</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium hidden md:table-cell">Bergabung</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {workers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-[#94A3B8]">Belum ada worker</td></tr>
                ) : workers.map((w) => (
                  <tr key={w.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{w.username[0]?.toUpperCase()}</span>
                        </div>
                        <span className="text-[#F8FAFC] font-medium text-sm">{w.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#94A3B8] text-sm hidden sm:table-cell">{w._count.orders} order</td>
                    <td className="px-6 py-4">
                      {w.isActive
                        ? <span className="badge-selesai">Aktif</span>
                        : <span className="badge-cancel">Nonaktif</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-[#94A3B8] text-sm hidden md:table-cell">
                      {new Date(w.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setShowToggle(w)} className={`p-1.5 rounded-lg transition-all text-xs font-medium px-2.5 py-1 ${w.isActive ? "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20" : "text-green-400 bg-green-500/10 hover:bg-green-500/20"}`}>
                          {w.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button onClick={() => setShowDelete(w)} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-all">
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
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Tambah Worker" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Username *</label>
            <input className="input" placeholder="worker01" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password *</label>
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Batal</button>
            <button onClick={handleAdd} disabled={submitting} className="btn-primary">{submitting ? "Menyimpan..." : "Tambah Worker"}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showDelete} onClose={() => setShowDelete(null)} title="Hapus Worker" size="sm">
        <div className="space-y-4">
          <p className="text-[#94A3B8]">Yakin ingin menghapus worker <span className="text-white font-medium">{showDelete?.username}</span>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowDelete(null)} className="btn-secondary">Batal</button>
            <button onClick={handleDelete} disabled={submitting} className="btn-danger">{submitting ? "Menghapus..." : "Hapus"}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showToggle} onClose={() => setShowToggle(null)} title={showToggle?.isActive ? "Nonaktifkan Worker" : "Aktifkan Worker"} size="sm">
        <div className="space-y-4">
          <p className="text-[#94A3B8]">
            Yakin ingin {showToggle?.isActive ? "menonaktifkan" : "mengaktifkan"} worker <span className="text-white font-medium">{showToggle?.username}</span>?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowToggle(null)} className="btn-secondary">Batal</button>
            <button onClick={handleToggle} disabled={submitting} className={showToggle?.isActive ? "btn-danger" : "btn-success"}>
              {submitting ? "Menyimpan..." : showToggle?.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
