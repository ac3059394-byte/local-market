"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import ProductFormModal from "@/components/ProductFormModal";
import type { Product, Shop } from "@/lib/types";

export default function ProductManagementPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const { data: shopsRes } = await api.get("/shops/mine");
      const myShop: Shop | undefined = shopsRes.data?.[0];
      setShop(myShop || null);
      if (myShop) {
        const { data: productsRes } = await api.get(`/shops/${myShop.id}/products`);
        setProducts(productsRes.data);
      }
    } catch {
      // not logged in yet
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleQuickStock(id: string, field: "quantity" | "sellingPrice", value: string) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: Number(value) } : p)));
    try {
      await api.patch(`/products/${id}/stock`, { [field]: Number(value) });
    } catch {
      // revert not implemented in this starter — surface a toast in production
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <p className="text-sm text-ink-400">Loading...</p>;

  if (!shop) {
    return (
      <div className="card p-8 text-center">
        <p className="text-ink-600">You need to set up your shop before adding products.</p>
        <a href="/dashboard/shop" className="btn-primary mt-4 inline-flex">Set up shop</a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-ink-600">{products.length} product{products.length !== 1 && "s"} listed</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-sand-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-sand-100 text-ink-600">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price (₹)</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-sand-200">
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                    {p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                  </div>
                  <span className="font-medium text-ink-900">{p.name}</span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={p.sellingPrice}
                    onBlur={(e) => handleQuickStock(p.id, "sellingPrice", e.target.value)}
                    className="w-24 rounded-lg border border-sand-200 px-2 py-1"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={p.quantity}
                    onBlur={(e) => handleQuickStock(p.id, "quantity", e.target.value)}
                    className="w-20 rounded-lg border border-sand-200 px-2 py-1"
                  />
                </td>
                <td className="px-4 py-3">
                  {p.status === "IN_STOCK" ? (
                    <span className="badge-verified">In stock</span>
                  ) : (
                    <span className="badge-out-of-stock">Out of stock</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingProduct(p); setModalOpen(true); }} aria-label="Edit">
                      <Pencil className="h-4 w-4 text-indigo-700" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-400">
                  No products yet — click &quot;Add product&quot; to list your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductFormModal
          shopId={shop.id}
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); loadData(); }}
        />
      )}
    </div>
  );
}
