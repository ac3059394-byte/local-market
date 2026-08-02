import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ShopCard from "@/components/ShopCard";
import SearchFilters from "@/components/SearchFilters";
import type { Paginated, Product, Shop } from "@/lib/types";

async function fetchProducts(searchParams: Record<string, string | undefined>) {
  const qs = new URLSearchParams(searchParams as Record<string, string>).toString();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/products?${qs}`, { cache: "no-store" });
    if (!res.ok) return { data: [], pagination: { total: 0 } } as Partial<Paginated<Product>>;
    return (await res.json()) as Paginated<Product>;
  } catch {
    return { data: [], pagination: { total: 0 } } as Partial<Paginated<Product>>;
  }
}

async function fetchShops(searchParams: Record<string, string | undefined>) {
  const qs = new URLSearchParams(searchParams as Record<string, string>).toString();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/shops?${qs}`, { cache: "no-store" });
    if (!res.ok) return { data: [], pagination: { total: 0 } } as Partial<Paginated<Shop>>;
    return (await res.json()) as Paginated<Shop>;
  } catch {
    return { data: [], pagination: { total: 0 } } as Partial<Paginated<Shop>>;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const tab = searchParams.tab === "shops" ? "shops" : "products";
  const [products, shops] = await Promise.all([fetchProducts(searchParams), fetchShops(searchParams)]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        {searchParams.q ? `Results for "${searchParams.q}"` : "Browse products"}
      </h1>
      <p className="mt-1 text-sm text-ink-600">
        {tab === "products" ? products.pagination?.total ?? 0 : shops.pagination?.total ?? 0} results found
      </p>

      {/* Tabs */}
      <div className="mt-4 flex gap-2 border-b border-sand-200">
        <Link
          href={`/search?${new URLSearchParams({ ...searchParams, tab: "products" } as Record<string, string>).toString()}`}
          className={`px-4 py-2 text-sm font-medium ${tab === "products" ? "border-b-2 border-marigold-500 text-indigo-700" : "text-ink-400"}`}
        >
          Products
        </Link>
        <Link
          href={`/search?${new URLSearchParams({ ...searchParams, tab: "shops" } as Record<string, string>).toString()}`}
          className={`px-4 py-2 text-sm font-medium ${tab === "shops" ? "border-b-2 border-marigold-500 text-indigo-700" : "text-ink-400"}`}
        >
          Shops
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <SearchFilters />

        <div className="flex-1">
          {tab === "products" ? (
            products.data && products.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <EmptyState label="No products matched your search." />
            )
          ) : shops.data && shops.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {shops.data.map((s) => (
                <ShopCard key={s.id} shop={s} />
              ))}
            </div>
          ) : (
            <EmptyState label="No shops matched your search." />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand-200 py-20 text-center">
      <p className="text-ink-600">{label}</p>
      <p className="mt-1 text-sm text-ink-400">Try a different keyword, or widen your filters.</p>
    </div>
  );
}
