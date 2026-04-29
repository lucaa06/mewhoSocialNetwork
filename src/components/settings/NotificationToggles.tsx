"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";

const NOTIF_GROUPS = [
  {
    label: "In-app",
    items: [
      { key: "inapp_likes",    label: "Like ai tuoi post",          defaultOn: true  },
      { key: "inapp_comments", label: "Commenti ai tuoi post",       defaultOn: true  },
      { key: "inapp_follows",  label: "Nuovi follower",              defaultOn: true  },
      { key: "inapp_messages", label: "Nuovi messaggi",              defaultOn: true  },
      { key: "inapp_mentions", label: "Menzioni (@username)",        defaultOn: true  },
    ],
  },
  {
    label: "Push (browser)",
    items: [
      { key: "push_likes",     label: "Like ai tuoi post",          defaultOn: false },
      { key: "push_comments",  label: "Commenti ai tuoi post",       defaultOn: false },
      { key: "push_follows",   label: "Nuovi follower",              defaultOn: false },
      { key: "push_messages",  label: "Nuovi messaggi",              defaultOn: false },
    ],
  },
  {
    label: "Email",
    items: [
      { key: "email_follows",  label: "Nuovi follower",              defaultOn: false },
      { key: "email_weekly",   label: "Digest settimanale",          defaultOn: false },
      { key: "email_security", label: "Avvisi di sicurezza",         defaultOn: true  },
    ],
  },
];

export function NotificationToggles() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("notif_prefs") : null;
    if (saved) return JSON.parse(saved);
    const defaults: Record<string, boolean> = {};
    NOTIF_GROUPS.forEach(g => g.items.forEach(i => { defaults[i.key] = i.defaultOn; }));
    return defaults;
  });

  function toggle(key: string) {
    setPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notif_prefs", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-black/50">Le notifiche push richiedono il permesso del browser.</p>
      {NOTIF_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-2">{group.label}</p>
          <div className="rounded-2xl border border-black/6 divide-y divide-black/4 overflow-hidden" style={{ background: "var(--card)" }}>
            {group.items.map(item => (
              <div key={item.key} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {prefs[item.key]
                    ? <Bell className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
                    : <BellOff className="w-4 h-4 shrink-0 text-black/25" strokeWidth={1.8} />
                  }
                  <span className="text-sm text-black">{item.label}</span>
                </div>
                <button onClick={() => toggle(item.key)}
                  className="w-11 h-6 rounded-full transition-colors relative shrink-0"
                  style={{ background: prefs[item.key] ? "var(--accent)" : "rgba(0,0,0,0.12)" }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                    style={{ left: prefs[item.key] ? "calc(100% - 1.375rem)" : "0.125rem" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
