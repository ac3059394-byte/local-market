import Image from "next/image";
import { notFound } from "next/navigation";
import { Phone, MessageCircle, Navigation, Star, BadgeCheck, Clock } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Shop, Product, Review } from "@/lib/types";

async function getShop(id: string): Promise<(Shop & { products: Product[]; reviews?: Review[] }) | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function ShopPage({ params }: { params: { id: string } }) {
  const shop = await getShop(params.id);
  if (!shop) notFound();

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 w-full bg-indigo-700 md:h-56">
        {shop.bannerUrl && <Image src={shop.bannerUrl} alt="" fill className="object-cover opacity-80" />}
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-sand-100 shadow-card">
            {shop.logoUrl && <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-ink-900">{shop.name}</h1>
              {shop.isVerified && <BadgeCheck className="h-5 w-5 text-mint-500" />}
            </div>
            <p className="text-sm text-ink-600">{shop.addressLine}, {shop.city}, {shop.state} — {shop.pincode}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-medium text-ink-900">
                <Star className="h-4 w-4 fill-marigold-500 text-marigold-500" />
                {shop.averageRating?.toFixed(1) || "New"} ({shop.reviewCount} reviews)
              </span>
              {shop.openingTime && (
                <span className="flex items-center gap-1 text-ink-600">
                  <Clock className="h-4 w-4" /> {shop.openingTime} – {shop.closingTime}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <a href={`tel:${shop.mobileNumber}`} className="btn-secondary">
              <Phone className="h-4 w-4" /> Call
            </a>
            {shop.whatsappNumber && (
              <a href={`https://wa.me/91${shop.whatsappNumber}`} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {shop.googleMapsUrl && (
              <a href={shop.googleMapsUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                <Navigation className="h-4 w-4" /> Directions
              </a>
            )}
          </div>
        </div>

        {shop.description && <p className="mt-6 max-w-2xl text-sm text-ink-600">{shop.description}</p>}

        {/* Products */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Products from this shop</h2>
          {shop.products?.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {shop.products.map((p) => (
                <ProductCard key={p.id} product={{ ...p, shop }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">This shop hasn&apos;t listed any products yet.</p>
          )}
        </section>

        {/* Reviews */}
        <section className="my-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Customer reviews</h2>
          {shop.reviews?.length ? (
            <div className="space-y-4">
              {shop.reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-900">{r.user?.name || "Anonymous"}</span>
                    <span className="flex items-center gap-0.5 text-marigold-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-marigold-500" />
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-ink-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400">No reviews yet — be the first to review this shop.</p>
          )}
        </section>
      </div>
    </div>
  );
}
