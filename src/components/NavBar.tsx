"use client";

import { logout } from "@/lib/actions/auth";
import { PROFILE_UPDATED_EVENT, fetchMyProfile } from "@/lib/friends";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";

const NAV_ITEMS = [
  { href: "/", label: "캘린더", isActive: (path: string) => path === "/" },
  { href: "/friends", label: "친구", isActive: (path: string) => path.startsWith("/friends") },
  { href: "/stats", label: "통계", isActive: (path: string) => path.startsWith("/stats") },
];

export default function NavBar() {
  const pathname = usePathname() ?? "";
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null));

    const handleUpdate = (e: Event) => setProfile((e as CustomEvent<Profile>).detail);
    window.addEventListener(PROFILE_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleUpdate);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                item.isActive(pathname)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {profile && (
            <Link
              href="/profile"
              title="내 프로필"
              className={[
                "flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors sm:pr-3",
                pathname.startsWith("/profile") ? "bg-indigo-50" : "hover:bg-slate-100",
              ].join(" ")}
            >
              <Avatar profile={profile} size={28} />
              <span className="hidden text-sm font-medium text-slate-600 sm:inline">
                {profile.nickname}
              </span>
            </Link>
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
