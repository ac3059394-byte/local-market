import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-sand-200 bg-indigo-700 text-sand-100">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            Local<span className="text-marigold-500">Market</span>
          </h3>
          <p className="mt-3 text-sm text-indigo-100/80">
            Apni dukaan, sabke paas. Connecting neighborhood shops with the customers searching for them.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Customers</h4>
          <ul className="space-y-2 text-sm text-indigo-100/80">
            <li><Link href="/search">Search products</Link></li>
            <li><Link href="/favorites">My favorites</Link></li>
            <li><Link href="/signup">Create account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Shop owners</h4>
          <ul className="space-y-2 text-sm text-indigo-100/80">
            <li><Link href="/dashboard/shop">List your shop</Link></li>
            <li><Link href="/dashboard/products">Manage products</Link></li>
            <li><Link href="/login">Owner login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
          <ul className="space-y-2 text-sm text-indigo-100/80">
            <li><Link href="/admin">Admin panel</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-indigo-100/60">
        © {new Date().getFullYear()} LocalMarket. All rights reserved.
      </div>
    </footer>
  );
}
