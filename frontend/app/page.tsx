import Link from "next/link";
import { Search, MapPin, Store, ShieldCheck, Truck, Star } from "lucide-react";

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", emoji: "📱" },
  { name: "Grocery", slug: "grocery", emoji: "🛒" },
  { name: "Fashion", slug: "fashion", emoji: "👗" },
  { name: "Home & Kitchen", slug: "home-kitchen", emoji: "🍳" },
  { name: "Hardware", slug: "hardware", emoji: "🔧" },
  { name: "Medical", slug: "medical", emoji: "💊" },
  { name: "Stationery", slug: "stationery", emoji: "📚" },
  { name: "Auto Parts", slug: "auto-parts", emoji: "🛠️" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-indigo-700">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-marigold-500/20 px-3 py-1 text-xs font-semibold text-marigold-400">
              Har mohalla, har dukaan — ab search mein
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
              Jo chahiye, wahi milega — apke aas-paas ki dukaano mein.
            </h1>
            <p className="mt-4 text-lg text-indigo-100/80">
              Search any product and instantly see which shops near you have it in stock —
              then call, WhatsApp, or walk in.
            </p>

            <form action="/search" className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-card sm:flex-row">
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <Search className="h-5 w-5 shrink-0 text-ink-400" />
                <input
                  name="q"
                  placeholder="Search for a product, brand or shop..."
                  className="w-full text-sm outline-none placeholder:text-ink-400"
                />
              </div>
              <button type="submit" className="btn-primary sm:px-8">
                Search
              </button>
            </form>

            <div className="mt-4 flex items-center gap-2 text-sm text-indigo-100/70">
              <MapPin className="h-4 w-4" />
              Showing results near <span className="font-semibold text-white">Lucknow, Uttar Pradesh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 className="mb-6 font-display text-xl font-semibold text-ink-900">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="card flex flex-col items-center gap-2 p-4 text-center"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-ink-900">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-sand-100 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 md:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-mint-50 p-3"><ShieldCheck className="h-5 w-5 text-mint-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-ink-900">Verified shops</h3>
              <p className="text-sm text-ink-600">Every listed shop is checked before it gets a verified badge.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-marigold-50 p-3"><Truck className="h-5 w-5 text-marigold-600" /></div>
            <div>
              <h3 className="font-display font-semibold text-ink-900">Delivery or pickup</h3>
              <p className="text-sm text-ink-600">See upfront which shops deliver and which are pickup-only.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-50 p-3"><Star className="h-5 w-5 text-indigo-700" /></div>
            <div>
              <h3 className="font-display font-semibold text-ink-900">Real customer reviews</h3>
              <p className="text-sm text-ink-600">Ratings from people who actually bought from that shop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop owner CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-indigo-700 p-8 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Apni dukaan online lao — muft mein.</h2>
            <p className="mt-2 text-indigo-100/80">
              List your shop, upload your products, and let customers searching nearby find you.
            </p>
          </div>
          <Link href="/dashboard/shop" className="btn-primary shrink-0">
            <Store className="h-4 w-4" /> List your shop
          </Link>
        </div>
      </section>
    </div>
  );
}
