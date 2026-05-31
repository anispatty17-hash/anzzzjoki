import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-[#2563EB] text-sm font-medium mb-4">404</p>
        <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">Halaman tidak ditemukan</h1>
        <p className="text-[#94A3B8] mb-8">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link href="/" className="btn-primary inline-flex">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
