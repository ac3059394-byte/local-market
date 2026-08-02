"use client";

import { useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import type { Product } from "@/lib/types";

const emptyForm = {
  name: "", description: "", brand: "", model: "", sku: "", barcode: "",
  sellingPrice: "", mrp: "", quantity: "", unit: "pcs",
  deliveryAvailable: false, pickupAvailable: true,
};

export default function ProductFormModal({
  shopId, product, onClose, onSaved,
}: {
  shopId: string;
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name, description: product.description || "", brand: product.brand || "",
          model: product.model || "", sku: product.sku || "", barcode: "",
          sellingPrice: String(product.sellingPrice), mrp: String(product.mrp || ""),
          quantity: String(product.quantity), unit: product.unit,
          deliveryAvailable: product.deliveryAvailable, pickupAvailable: product.pickupAvailable,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        shopId,
        sellingPrice: Number(form.sellingPrice),
        mrp: form.mrp ? Number(form.mrp) : undefined,
        quantity: Number(form.quantity),
      };
      if (product) {
        await api.patch(`/products/${product.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {product ? "Edit product" : "Add product"}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-ink-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-900">Product name</label>
            <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-900">Description</label>
            <textarea className="input min-h-20" value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-900">Brand</label>
            <input className="input" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-900">Model</label>
            <input className="input" value={form.model} onChange={(e) => update("model", e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-900">Selling price (₹)</label>
            <input type="number" className="input" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-900">MRP (₹)</label>
            <input type="number" className="input" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-900">Quantity available</label>
            <input type="number" className="input" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-900">Unit</label>
            <select className="input" value={form.unit} onChange={(e) => update("unit", e.target.value)}>
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="litre">litre</option>
              <option value="box">box</option>
              <option value="dozen">dozen</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-sand-200 text-marigold-500"
              checked={form.deliveryAvailable}
              onChange={(e) => update("deliveryAvailable", e.target.checked)}
            />
            <label className="text-sm text-ink-900">Delivery available</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-sand-200 text-marigold-500"
              checked={form.pickupAvailable}
              onChange={(e) => update("pickupAvailable", e.target.checked)}
            />
            <label className="text-sm text-ink-900">Store pickup available</label>
          </div>

          {error && <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>}

          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving..." : product ? "Save changes" : "Add product"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
