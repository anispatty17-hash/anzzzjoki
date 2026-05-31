"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import type { Role } from "@/types";

interface MobileSidebarProps {
  role: Role;
  username: string;
}

export default function MobileSidebar({ role, username }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-[#111827] border border-white/10 text-[#94A3B8] hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 animate-slide-up">
            <Sidebar role={role} username={username} />
          </div>
        </div>
      )}
    </>
  );
}
