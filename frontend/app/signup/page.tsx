"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, User } from "lucide-react";
import api from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "SHOP_OWNER">("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { name, email, phone, password, role });
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      router.push(role === "SHOP_OWNER" ? "/dashboard/shop" : "/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Create your account</h1>
      <p className="mt-1 text-sm text-ink-600">Join as a customer, or list your shop for free.</p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("CUSTOMER")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
            role === "CUSTOMER" ? "border-indigo-700 bg-indigo-50 text-indigo-700" : "border-sand-200 text-ink-600"
          }`}
        >
          <User className="h-4 w-4" /> Customer
        </button>
        <button
          type="button"
          onClick={() => setRole("SHOP_OWNER")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
            role === "SHOP_OWNER" ? "border-indigo-700 bg-indigo-50 text-indigo-700" : "border-sand-200 text-ink-600"
          }`}
        >
          <Store className="h-4 w-4" /> Shop owner
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-900">Full name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-900">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-900">Phone number</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-900">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : role === "SHOP_OWNER" ? "Create shop owner account" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600">
        Already have an account? <Link href="/login" className="font-medium text-indigo-700">Login</Link>
      </p>
    </div>
  );
}
