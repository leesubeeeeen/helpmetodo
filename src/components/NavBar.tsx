"use client";

import { logout } from "@/lib/actions/auth";
import { fetchMyProfile } from "@/lib/friends";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === "/"
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            ].join(" ")}
          >
            캘린더
          </Link>
          <Link
            href="/friends"
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              pathname?.startsWith("/friends")
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            ].join(" ")}
          >
            친구
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden text-xs text-slate-400 sm:inline">
              {profile.nickname}
              <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-500">
                {profile.friend_code}
              </span>
            </span>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
