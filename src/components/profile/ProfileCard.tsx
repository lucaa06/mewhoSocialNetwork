import Link from "next/link";
import type { Profile } from "@/types/database";
import { getAvatarFallback } from "@/lib/utils";
import { MapPin } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  startupper: "Startupper",
  researcher: "Ricercatore",
  user: "Utente",
  admin: "Admin",
};

type P = Pick<Profile, "id" | "username" | "display_name" | "avatar_url" | "role" | "country_code" | "city" | "bio" | "is_verified">;

export function ProfileCard({ profile }: { profile: P }) {
  return (
    <Link href={`/u/${profile.username}`} className="bg-white rounded-2xl border border-black/6 p-4 hover:border-black/12 transition-colors block">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-black/6 text-black flex items-center justify-center font-semibold text-sm overflow-hidden shrink-0">
          {profile.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            : getAvatarFallback(profile.display_name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-black text-sm truncate">{profile.display_name}</span>
            {profile.is_verified && <span className="text-black/40 text-[10px]">✓</span>}
          </div>
          <p className="text-[11px] text-black/35">@{profile.username}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] bg-black/5 text-black/50 px-2 py-0.5 rounded-full">
              {ROLE_LABELS[profile.role] ?? profile.role}
            </span>
            {(profile.city || profile.country_code) && (
              <span className="text-[11px] text-black/30 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" /> {profile.city ?? profile.country_code}
              </span>
            )}
          </div>
          {profile.bio && <p className="text-xs text-black/40 mt-2 line-clamp-2">{profile.bio}</p>}
        </div>
      </div>
    </Link>
  );
}
