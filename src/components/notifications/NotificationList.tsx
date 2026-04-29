"use client";

import Link from "next/link";
import { formatDate, getAvatarFallback } from "@/lib/utils";
import { UserPlus, Heart, MessageCircle, FileText, Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

const REACTION_EMOJI: Record<string, string> = {
  like:  "❤️",
  idea:  "💡",
  support: "🤝",
};

function NotificationItem({ n }: { n: Notification }) {
  const p = n.payload;
  const actorName    = (p.actor_display_name as string) ?? "Qualcuno";
  const actorUser    = (p.actor_username    as string) ?? "";
  const avatarEmoji  = p.actor_avatar_emoji as string | null;
  const avatarUrl    = p.actor_avatar_url   as string | null;

  /* ── testo + link ── */
  let text: React.ReactNode = null;
  let href = "/";
  let Icon = Bell;
  let iconBg = "var(--surface)";
  let iconColor = "var(--muted)";

  if (n.type === "follow") {
    text = <><strong>{actorName}</strong> ha iniziato a seguirti</>;
    href = `/u/${actorUser}`;
    Icon = UserPlus;
    iconBg = "rgba(255,74,36,0.12)";
    iconColor = "#FF4A24";
  } else if (n.type === "new_post") {
    const communityName = p.community_name as string | null;
    const postTitle     = p.post_title     as string | null;
    if (communityName) {
      text = <><strong>{actorName}</strong> ha pubblicato nella community <strong>{communityName}</strong>{postTitle ? `: "${postTitle}"` : ""}</>;
    } else {
      text = <><strong>{actorName}</strong> ha pubblicato un nuovo post{postTitle ? `: "${postTitle}"` : ""}</>;
    }
    href = p.post_id ? `/post/${p.post_id}` : `/u/${actorUser}`;
    Icon = FileText;
    iconBg = "rgba(14,165,233,0.12)";
    iconColor = "#0EA5E9";
  } else if (n.type === "reaction") {
    const emoji = REACTION_EMOJI[(p.reaction_type as string) ?? "like"] ?? "❤️";
    const postTitle = p.post_title as string | null;
    text = <><strong>{actorName}</strong> ha reagito {emoji} al tuo post{postTitle ? ` "${postTitle}"` : ""}</>;
    href = p.post_id ? `/post/${p.post_id}` : "/";
    Icon = Heart;
    iconBg = "rgba(239,68,68,0.12)";
    iconColor = "#EF4444";
  } else if (n.type === "comment") {
    const preview   = p.comment_preview as string | null;
    const postTitle = p.post_title      as string | null;
    text = <><strong>{actorName}</strong> ha commentato{postTitle ? ` "${postTitle}"` : " il tuo post"}{preview ? `: "${preview}"` : ""}</>;
    href = p.post_id ? `/post/${p.post_id}` : "/";
    Icon = MessageCircle;
    iconBg = "rgba(109,65,255,0.12)";
    iconColor = "#6D41FF";
  } else {
    text = n.type;
  }

  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 rounded-2xl transition-all hover:scale-[1.005] active:scale-[.99]"
      style={{
        background: n.is_read ? "var(--card)" : "var(--accent-soft)",
        border: `1px solid ${n.is_read ? "var(--border)" : "rgba(255,74,36,0.18)"}`,
      }}
    >
      {/* Actor avatar */}
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden text-lg"
          style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}
        >
          {avatarEmoji
            ? <span style={{ lineHeight: 1 }}>{avatarEmoji}</span>
            : avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatarUrl} alt={actorName} className="w-full h-full object-cover" />
            : <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>
                {getAvatarFallback(actorName)}
              </span>
          }
        </div>
        {/* Type icon badge */}
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: iconBg, border: "1.5px solid var(--card)" }}
        >
          <Icon className="w-2.5 h-2.5" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: "var(--fg)" }}>{text}</p>
        <p className="text-xs mt-1" style={{ color: "var(--subtle)" }}>{formatDate(n.created_at)}</p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "#FF4A24" }} />
      )}
    </Link>
  );
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border p-14 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--subtle)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>Nessuna notifica</p>
        <p className="text-xs mt-1" style={{ color: "var(--subtle)" }}>Ti avviseremo quando qualcuno interagisce con te</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map(n => <NotificationItem key={n.id} n={n} />)}
    </div>
  );
}
