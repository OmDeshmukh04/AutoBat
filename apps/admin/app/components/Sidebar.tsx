"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "../lib/nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand-block">
        <span className="brand-mark">AB</span>
        <span className="brand-text">
          <strong>AUTOBAT</strong>
          <small>Operations</small>
        </span>
      </Link>

      <nav className="nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="nav-section">
            <p className="nav-heading">{section.heading}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <span className="env-pill">Demo data</span>
      </div>
    </aside>
  );
}
