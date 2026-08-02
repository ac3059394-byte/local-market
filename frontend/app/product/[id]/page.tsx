import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, MessageCircle, Truck, PackageCheck, BadgeCheck } from "lucide-react";
import type { Product, Shop } from "@/lib/types";

async function getProduct(id: string): Promise<(Product & { shop: Shop }) | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const outOfStock = product.status === "OUT_OF_STOCK";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-sand-100">
            {product.images?.[0] ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-400">No image available</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-sand-100">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.brand && <p className="text-sm font-medium text-indigo-700">{product.brand}</p>}
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-ink-900">
              ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
            </span>
            {product.mrp && Number(product.mrp) > Number(product.sellingPrice) && (
              <>
                <span className="text-lg text-ink-400 line-through">₹{Number(product.mrp).toLocaleString("en-IN")}</span>
                <span className="font-semibold text-mint-600">{Math.round(product.discountPercent || 0)}% off</span>
              </>
            )}
          </div>

          <div className="mt-4">
            {outOfStock ? (
              <span className="badge-out-of-stock">Out of stock</span>
            ) : (
              <span className="badge-verified">In stock ({product.quantity} {product.unit})</span>
            )}
          </div>

          <div className="mt-4 flex gap-4 text-sm text-ink-600">
            {product.deliveryAvailable && (
              <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Delivery available</span>
            )}
            {product.pickupAvailable && (
              <span className="flex items-center gap-1"><PackageCheck className="h-4 w-4" /> Store pickup</span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-ink-600">{product.description}</p>
          )}

          {/* Shop info card */}
          <Link href={`/shop/${product.shop.id}`} className="card mt-8 flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-semibold text-ink-900">{product.shop.name}</span>
                {product.shop.isVerified && <BadgeCheck className="h-4 w-4 text-mint-500" />}
              </div>
              <p className="flex items-center gap-1 text-xs text-ink-400">
                <MapPin className="h-3 w-3" /> {product.shop.city}, {product.shop.state}
              </p>
            </div>
            <span className="text-sm font-medium text-indigo-700">View shop →</span>
          </Link>

          <div className="mt-4 flex gap-3">
            <a href={`tel:${product.shop.mobileNumber}`} className="btn-secondary flex-1">
              <Phone className="h-4 w-4" /> Call shop
            </a>
            {product.shop.whatsappNumber && (
              <a
                href={`https://wa.me/91${product.shop.whatsappNumber}?text=${encodeURIComponent(
                  `Hi, I'm interested in "${product.name}" listed on LocalMarket.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex-1"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
