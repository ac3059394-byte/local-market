import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import type { Shop } from "@/lib/types";

export default function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link href={`/shop/${shop.id}`} className="card flex gap-4 overflow-hidden p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100">
        {shop.logoUrl ? (
          <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-400">No logo</div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-display text-sm font-semibold text-ink-900">{shop.name}</h3>
          {shop.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-mint-500" />}
        </div>

        <p className="flex items-center gap-1 truncate text-xs text-ink-400">
          <MapPin className="h-3 w-3 shrink-0" /> {shop.addressLine}, {shop.city}
        </p>

        <div className="mt-1 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-medium text-ink-900">
            <Star className="h-3.5 w-3.5 fill-marigold-500 text-marigold-500" />
            {shop.averageRating?.toFixed(1) || "New"}
            <span className="text-ink-400">({shop.reviewCount})</span>
          </span>
          {typeof shop.distanceKm === "number" && (
            <span className="text-ink-400">{shop.distanceKm.toFixed(1)} km away</span>
          )}
          {shop.membershipTier === "PREMIUM" && (
            <span className="rounded-full bg-marigold-50 px-2 py-0.5 font-semibold text-marigold-600">Featured</span>
          )}
        </div>
      </div>
    </Link>
  );
}
