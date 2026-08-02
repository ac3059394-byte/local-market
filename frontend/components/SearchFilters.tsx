"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Highest discount" },
];

export default function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/search?${next.toString()}`);
  }

  return (
    <aside className="w-full shrink-0 space-y-6 md:w-64">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-ink-900">Sort by</h4>
        <select
          className="input text-sm"
          defaultValue={params.get("sortBy") || "relevance"}
          onChange={(e) => updateParam("sortBy", e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-ink-900">Price range (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="input text-sm"
            defaultValue={params.get("minPrice") || ""}
            onBlur={(e) => updateParam("minPrice", e.target.value || null)}
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            placeholder="Max"
            className="input text-sm"
            defaultValue={params.get("maxPrice") || ""}
            onBlur={(e) => updateParam("maxPrice", e.target.value || null)}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink-900">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-sand-200 text-marigold-500 focus:ring-marigold-500"
            defaultChecked={params.get("deliveryOnly") === "true"}
            onChange={(e) => updateParam("deliveryOnly", e.target.checked ? "true" : null)}
          />
          Delivery available
        </label>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-ink-900">City</h4>
        <input
          type="text"
          placeholder="e.g. Lucknow"
          className="input text-sm"
          defaultValue={params.get("city") || ""}
          onBlur={(e) => updateParam("city", e.target.value || null)}
        />
      </div>
    </aside>
  );
}
