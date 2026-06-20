"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { NAV_LOOKUP } from "../lib/nav";
import { useAuth } from "../lib/auth";

function titleFor(pathname: string): string {
  if (NAV_LOOKUP[pathname]) {
    return NAV_LOOKUP[pathname].label;
  }
  // Fall back to the first matching nav prefix for nested routes.
  const match = Object.keys(NAV_LOOKUP)
    .filter((href) => href !== "/" && pathname.startsWith(href))
    .sort((a, b) => b.length - a.length)[0];
  return match ? (NAV_LOOKUP[match]?.label ?? "Operations") : "Operations";
}

export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{titleFor(pathname)}</h1>
      </div>
      <div className="topbar-actions">
        <label className="search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Search serials, claims, partners…"
            aria-label="Search"
          />
        </label>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={18} aria-hidden />
          <span className="badge-dot" aria-hidden />
        </button>
        <div className="user-chip">
          <span className="avatar" aria-hidden>
            {initials(user?.name)}
          </span>
          <span className="user-meta">
            <strong>{user?.name ?? "Admin"}</strong>
            <small>{user?.orgName ?? "AutoBat HQ"}</small>
          </span>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label="Sign out"
          title="Sign out"
          onClick={logout}
        >
          <LogOut size={18} aria-hidden />
        </button>
      </div>
    </header>
  );
}

function initials(name?: string): string {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "AD";
}
