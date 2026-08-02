"use client";

import { useEffect, useState } from "react";
import { Users, Store, Package, Flag, Star } from "lucide-react";
import api from "@/lib/api";

interface Stats {
  userCount: number;
  shopCount: number;
  productCount: number;
  pendingReports: number;
  reviewCount: number;
}

interface Report {
  id: string;
  reason: string;
  status: string;
  user?: { name: string };
  shop?: { name: string };
  product?: { name: string };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/reports"),
      ]);
      setStats(statsRes.data.data);
      setReports(reportsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "You need admin access to view this page.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function resolveReport(id: string, status: "REVIEWED" | "DISMISSED") {
    await api.patch(`/admin/reports/${id}`, { status });
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-ink-400">Loading...</p>;
  if (error) return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-rose-500">{error}</p>;

  const cards = [
    { label: "Users", value: stats?.userCount, icon: Users, color: "text-indigo-700 bg-indigo-50" },
    { label: "Shops", value: stats?.shopCount, icon: Store, color: "text-marigold-600 bg-marigold-50" },
    { label: "Products", value: stats?.productCount, icon: Package, color: "text-mint-600 bg-mint-50" },
    { label: "Reviews", value: stats?.reviewCount, icon: Star, color: "text-indigo-700 bg-indigo-50" },
    { label: "Pending reports", value: stats?.pendingReports, icon: Flag, color: "text-rose-500 bg-rose-500/10" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Admin dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-4">
              <div className={`mb-2 inline-flex rounded-xl p-2 ${c.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-ink-900">{c.value ?? 0}</p>
              <p className="text-xs text-ink-400">{c.label}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 mb-4 font-display text-lg font-semibold text-ink-900">Pending reports</h2>
      {reports.length === 0 ? (
        <p className="text-sm text-ink-400">No pending reports — all clear.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {r.shop?.name || r.product?.name || "Unknown listing"}
                </p>
                <p className="text-xs text-ink-400">
                  Reported by {r.user?.name || "a user"} — {r.reason}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => resolveReport(r.id, "REVIEWED")} className="btn-secondary !py-1.5 text-xs">
                  Mark reviewed
                </button>
                <button onClick={() => resolveReport(r.id, "DISMISSED")} className="btn-secondary !py-1.5 text-xs">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
