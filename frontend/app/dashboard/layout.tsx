"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Package, BarChart3, MessageSquare } from "lucide-react";

const NAV = [
  { href: "/dashboard/shop", label: "My Shop", icon: Store },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:px-6">
      <aside className="w-full shrink-0 md:w-56">
        <h2 className="mb-3 px-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-400">
          Shop Dashboard
        </h2>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-indigo-700 text-white" : "text-ink-600 hover:bg-sand-100"
                }`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
