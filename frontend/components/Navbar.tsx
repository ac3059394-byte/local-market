"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, Menu, X, Store, Heart, User } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700">
            <Store className="h-5 w-5 text-marigold-500" />
          </div>
          <span className="font-display text-lg font-semibold text-indigo-700">
            Local<span className="text-marigold-500">Market</span>
          </span>
        </Link>

        {/* Desktop search */}
        <form action="/search" className="mx-auto hidden max-w-xl flex-1 items-center gap-2 md:flex">
          <div className="flex w-full items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              name="q"
              placeholder="Search products, brands or shops..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
            />
            <div className="hidden items-center gap-1 border-l border-sand-200 pl-3 text-xs text-ink-600 lg:flex">
              <MapPin className="h-3.5 w-3.5" />
              <span>Lucknow</span>
            </div>
          </div>
          <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
            Search
          </button>
        </form>

        <nav className="hidden items-center gap-5 text-sm font-medium text-ink-600 md:flex">
          <Link href="/favorites" className="flex items-center gap-1 hover:text-indigo-700">
            <Heart className="h-4 w-4" /> Favorites
          </Link>
          <Link href="/dashboard/shop" className="flex items-center gap-1 hover:text-indigo-700">
            <Store className="h-4 w-4" /> Sell on LocalMarket
          </Link>
          <Link href="/login" className="flex items-center gap-1 hover:text-indigo-700">
            <User className="h-4 w-4" /> Login
          </Link>
        </nav>

        <button className="ml-auto md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-sand-200 bg-white px-4 py-4 md:hidden">
          <form action="/search" className="mb-4 flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2">
            <Search className="h-4 w-4 text-ink-400" />
            <input name="q" placeholder="Search products, brands or shops..." className="w-full bg-transparent text-sm outline-none" />
          </form>
          <div className="flex flex-col gap-3 text-sm font-medium text-ink-600">
            <Link href="/favorites">Favorites</Link>
            <Link href="/dashboard/shop">Sell on LocalMarket</Link>
            <Link href="/login">Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}
