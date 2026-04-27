"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

interface GeoFilterProps {
  currentCountry?: string;
  currentCity?: string;
  detectedCountry: string | null;
}

export function GeoFilter({ currentCountry, currentCity, detectedCountry }: GeoFilterProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-black/6 text-xs">
      <MapPin className="w-3.5 h-3.5 text-black/30 shrink-0" />
      <span className="text-black/45">
        {currentCity ? `${currentCity}, ${currentCountry}` : currentCountry ?? "Tutto il mondo"}
      </span>
      {detectedCountry && currentCountry !== detectedCountry && (
        <Link href={`/?country=${detectedCountry}`} className="ml-auto text-black/40 hover:text-black underline underline-offset-2 transition-colors">
          Usa {detectedCountry}
        </Link>
      )}
      {currentCountry && (
        <Link href="/" className="ml-auto text-black/25 hover:text-black/55 transition-colors">
          Globale
        </Link>
      )}
    </div>
  );
}
