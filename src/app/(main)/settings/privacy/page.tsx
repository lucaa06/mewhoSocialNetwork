import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy & Cookie" };

export default function PrivacySettingsPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <h2 className="text-lg font-semibold text-black">Privacy & Cookie</h2>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-black">Termini di servizio</h3>
        <p className="text-black/60">Usando me&amp;who accetti di non pubblicare contenuti illegali, non molestare altri utenti e rispettare le linee guida della community. Ci riserviamo il diritto di rimuovere contenuti o account che violino questi termini.</p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-black">Privacy Policy — GDPR</h3>
        <div className="space-y-2 text-black/60">
          <p><strong className="text-black">Titolare:</strong> me&amp;who · lucacutrono06@gmail.com</p>
          <p><strong className="text-black">Dati raccolti:</strong> Email, nome, username, città, bio, ruolo, post, reazioni, commenti. I messaggi sono cifrati E2E e non accessibili ai nostri server.</p>
          <p><strong className="text-black">Finalità:</strong> Erogare il servizio, mostrare contenuti rilevanti, garantire la sicurezza della piattaforma.</p>
          <p><strong className="text-black">Base giuridica:</strong> Art. 6.1.b GDPR (contratto) per i dati necessari al servizio. Art. 6.1.a GDPR (consenso) per i cookie opzionali.</p>
          <p><strong className="text-black">Conservazione:</strong> Fino all'eliminazione dell'account. I dati sono ospitati su Supabase (AWS eu-central-1, Francoforte, UE).</p>
          <p><strong className="text-black">I tuoi diritti:</strong> Accesso, rettifica, cancellazione, portabilità, opposizione al trattamento (Art. 15-21 GDPR). Scrivi a <a href="mailto:lucacutrono06@gmail.com" style={{color:"var(--accent)"}}>lucacutrono06@gmail.com</a>.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-black">Cookie</h3>
        <div className="space-y-2">
          {[
            { name: "Cookie tecnici", status: "Sempre attivi", statusColor: "text-green-600 bg-green-50 border-green-100", desc: "Sessione di autenticazione e preferenze tema. Necessari per il funzionamento — non richiedono consenso (Considerando 47 GDPR)." },
            { name: "Cookie analitici", status: "Non usati", statusColor: "text-black/40 bg-black/5 border-transparent", desc: "Non raccogliamo dati analitici di terze parti. Nessun Google Analytics, nessun pixel di tracciamento." },
            { name: "Cookie marketing", status: "Non usati", statusColor: "text-black/40 bg-black/5 border-transparent", desc: "Nessuna pubblicità, nessun remarketing, nessuna condivisione con terze parti a fini commerciali." },
          ].map(c => (
            <div key={c.name} className="rounded-xl border border-black/8 p-4" style={{background:"var(--card)"}}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-black text-sm">{c.name}</p>
                <span className={`text-[11px] border px-2 py-0.5 rounded-full ${c.statusColor}`}>{c.status}</span>
              </div>
              <p className="text-xs text-black/50">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-black/30 pb-4">Ultimo aggiornamento: aprile 2026</p>
    </div>
  );
}
