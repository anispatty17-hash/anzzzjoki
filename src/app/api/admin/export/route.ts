import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const orders = await prisma.order.findMany({
      include: { worker: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });

    const rows = orders.map((o) => ({
      ID: o.id,
      Game: o.game,
      "Tipe Order": o.orderType,
      "Nama Customer": o.customerName,
      Harga: o.harga,
      "Bagian Owner": o.ownerCut,
      "Bagian Worker": o.workerIncome,
      Status: o.status,
      Worker: o.worker?.username ?? "-",
      Catatan: o.note ?? "",
      "Tanggal Mulai": o.startDate ? new Date(o.startDate).toLocaleDateString("id-ID") : "-",
      "Tanggal Selesai": o.finishDate ? new Date(o.finishDate).toLocaleDateString("id-ID") : "-",
      "Tanggal Dibuat": new Date(o.createdAt).toLocaleDateString("id-ID"),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    const colWidths = [
      { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
      { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="anzzzjoki-orders-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ success: false, error: "Gagal export data" }, { status: 500 });
  }
}
