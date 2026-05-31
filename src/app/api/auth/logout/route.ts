import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logout berhasil" });
  response.cookies.delete("anzzzjoki_token");
  return response;
}
