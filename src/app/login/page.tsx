"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success: boolean; data?: { role: string }; error?: string };

      if (!data.success) {
        setError(data.error ?? "Login gagal");
        return;
      }

      if (data.data?.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/worker/dashboard");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      <div className="hidden lg:flex w-1/2 bg-[#111827] border-r border-white/5 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-bold text-2xl">AJ</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">AnzzzJoki</h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed">
            Platform manajemen joki profesional. Kelola order, pantau worker, dan lacak pendapatan dalam satu dashboard.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { title: "Manajemen Order", desc: "Buat, pantau, dan kelola semua order dalam satu tempat" },
              { title: "Worker Dashboard", desc: "Worker bisa mengambil dan menyelesaikan order dengan mudah" },
              { title: "Laporan Lengkap", desc: "Statistik pendapatan dan performa yang detail" },
              { title: "Export Excel", desc: "Download laporan dalam format Excel kapan saja" },
            ].map((f) => (
              <div key={f.title} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-white font-medium text-sm mb-1">{f.title}</p>
                <p className="text-[#94A3B8] text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AJ</span>
            </div>
            <span className="text-white font-bold text-xl">AnzzzJoki</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Selamat datang</h2>
            <p className="text-[#94A3B8]">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Username</label>
              <input
                type="text"
                className="input"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <p className="text-center text-[#94A3B8] text-sm mt-6">
            <a href="/" className="text-[#2563EB] hover:text-blue-400 transition-colors">
              ← Kembali ke halaman publik
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
