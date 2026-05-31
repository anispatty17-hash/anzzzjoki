import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const workers = await prisma.user.findMany({
      where: { role: "WORKER" },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: workers });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal mengambil data worker" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "ADMIN") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username dan password wajib" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const worker = await prisma.user.create({
      data: { username, password: hashed, role: "WORKER" },
      select: { id: true, username: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: worker }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal membuat worker" }, { status: 500 });
  }
}
