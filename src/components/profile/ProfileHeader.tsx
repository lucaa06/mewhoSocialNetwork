"use client";

import type { Profile } from "@/types/database";
import { getAvatarFallback } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  startupper: "Startupper",
  researcher: "Ricercatore",
  user: "Utente",
};

export function ProfileHeader({ profile, followersCount, followingCount }: {
  profile: Profile;
  followersCount: number;
  followingCount: number;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .then(({ count }) => setIsFollowing((count ?? 0) > 0));
      }
    });
  }, [profile.id]);

  async function toggleFollow() {
    if (!currentUserId) return;
    const supabase = createClient();
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", profile.id);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: profile.id });
      setIsFollowing(true);
    }
  }

  const isOwn = currentUserId === profile.id;

  return (
    <div className="bg-white rounded-2xl border border-black/6 p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-black/6 text-black flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
          {profile.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            : getAvatarFallback(profile.display_name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black">{profile.display_name}</h1>
                {profile.is_verified && <span className="text-black/40 text-xs">✓</span>}
              </div>
              <p className="text-sm text-black/35">@{profile.username}</p>
            </div>

            {isOwn ? (
              <Link href="/settings/profile" className="px-4 py-1.5 rounded-full border border-black/12 text-black/50 hover:text-black hover:border-black/25 text-sm transition-colors">
                Modifica
              </Link>
            ) : currentUserId ? (
              <button
                onClick={toggleFollow}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  isFollowing
                    ? "border border-black/12 text-black/50 hover:text-black hover:border-black/25"
                    : "bg-black text-white hover:bg-black/85"
                }`}
              >
                {isFollowing ? "Non seguire" : "Segui"}
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-black/5 text-black/50 px-2 py-0.5 rounded-full">
              {ROLE_LABELS[profile.role] ?? profile.role}
            </span>
            {(profile.city || profile.country_code) && (
              <span className="text-xs text-black/35 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{profile.city ?? profile.country_code}
              </span>
            )}
          </div>

          {profile.bio && <p className="text-sm text-black/55 mt-3 leading-relaxed">{profile.bio}</p>}

          <div className="flex gap-5 mt-3 text-sm">
            <span><strong className="text-black font-semibold">{followersCount}</strong> <span className="text-black/35">follower</span></span>
            <span><strong className="text-black font-semibold">{followingCount}</strong> <span className="text-black/35">seguiti</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
