"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Shop } from "@/lib/types";

const emptyShop = {
  name: "", ownerName: "", mobileNumber: "", whatsappNumber: "", email: "",
  addressLine: "", pincode: "", state: "", district: "", city: "",
  latitude: "", longitude: "", googleMapsUrl: "",
  openingTime: "", closingTime: "", weeklyHoliday: "", description: "",
};

export default function ShopSettingsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [form, setForm] = useState(emptyShop);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/shops/mine");
        if (data.data?.[0]) {
          const s: Shop = data.data[0];
          setShop(s);
          setForm({
            name: s.name, ownerName: s.ownerName, mobileNumber: s.mobileNumber,
            whatsappNumber: s.whatsappNumber || "", email: s.email || "",
            addressLine: s.addressLine, pincode: s.pincode, state: s.state,
            district: s.district, city: s.city,
            latitude: String(s.latitude), longitude: String(s.longitude),
            googleMapsUrl: s.googleMapsUrl || "", openingTime: s.openingTime || "",
            closingTime: s.closingTime || "", weeklyHoliday: s.weeklyHoliday || "",
            description: s.description || "",
          });
        }
      } catch {
        // not logged in / no shop yet — show empty form
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      if (shop) {
        await api.patch(`/shops/${shop.id}`, form);
        setMessage("Shop details updated.");
      } else {
        const { data } = await api.post("/shops", form);
        setShop(data.data);
        setMessage("Shop created! You can now add products.");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-400">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl font-semibold text-ink-900">
        {shop ? "Edit shop details" : "List your shop"}
      </h1>
      <p className="mt-1 text-sm text-ink-600">
        {shop ? "Keep your shop info accurate so customers can find and trust you." : "Fill this once — takes about 2 minutes."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Shop name" value={form.name} onChange={(v) => update("name", v)} required />
        <Field label="Owner name" value={form.ownerName} onChange={(v) => update("ownerName", v)} required />
        <Field label="Mobile number" value={form.mobileNumber} onChange={(v) => update("mobileNumber", v)} required />
        <Field label="WhatsApp number" value={form.whatsappNumber} onChange={(v) => update("whatsappNumber", v)} />
        <Field label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" />
        <Field label="Google Maps link" value={form.googleMapsUrl} onChange={(v) => update("googleMapsUrl", v)} />

        <div className="sm:col-span-2">
          <Field label="Address" value={form.addressLine} onChange={(v) => update("addressLine", v)} required />
        </div>
        <Field label="City" value={form.city} onChange={(v) => update("city", v)} required />
        <Field label="District" value={form.district} onChange={(v) => update("district", v)} required />
        <Field label="State" value={form.state} onChange={(v) => update("state", v)} required />
        <Field label="Pincode" value={form.pincode} onChange={(v) => update("pincode", v)} required />
        <Field label="Latitude" value={form.latitude} onChange={(v) => update("latitude", v)} required />
        <Field label="Longitude" value={form.longitude} onChange={(v) => update("longitude", v)} required />

        <Field label="Opening time" value={form.openingTime} onChange={(v) => update("openingTime", v)} placeholder="09:00" />
        <Field label="Closing time" value={form.closingTime} onChange={(v) => update("closingTime", v)} placeholder="21:00" />
        <Field label="Weekly holiday" value={form.weeklyHoliday} onChange={(v) => update("weeklyHoliday", v)} placeholder="Sunday" />

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink-900">Description</label>
          <textarea
            className="input min-h-24"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        {message && <p className="text-sm text-mint-600 sm:col-span-2">{message}</p>}

        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : shop ? "Save changes" : "Create shop"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required = false, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-900">{label}</label>
      <input
        type={type}
        className="input"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
