import Link from "next/link";
import Image from "next/image";
import { MapPin, Truck } from "lucide-react";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.status === "OUT_OF_STOCK";

  return (
    <Link href={`/product/${product.id}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-sand-100">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-ink-400">No image</div>
        )}
        {product.discountPercent ? (
          <span className="absolute left-2 top-2 rounded-full bg-marigold-500 px-2 py-1 text-xs font-bold text-ink-900">
            {Math.round(product.discountPercent)}% OFF
          </span>
        ) : null}
        {outOfStock && (
          <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium text-ink-900">{product.name}</p>
        {product.brand && <p className="text-xs text-ink-400">{product.brand}</p>}

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-base font-semibold text-indigo-700">
            ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
          </span>
          {product.mrp && Number(product.mrp) > Number(product.sellingPrice) && (
            <span className="text-xs text-ink-400 line-through">₹{Number(product.mrp).toLocaleString("en-IN")}</span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
          {product.shop && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" /> {product.shop.city}
            </span>
          )}
          {product.deliveryAvailable && (
            <span className="flex items-center gap-1 text-mint-600">
              <Truck className="h-3 w-3" /> Delivery
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
