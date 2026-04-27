import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini di servizio",
  description: "Termini e condizioni di utilizzo di me&who.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-black mb-8">Termini di servizio</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-black/55 text-sm mb-6">Ultimo aggiornamento: Aprile 2026</p>
        <h2>1. Accettazione dei termini</h2>
        <p>
          Utilizzando me&amp;who accetti i presenti Termini di Servizio. Se non li accetti,
          non puoi utilizzare la piattaforma.
        </p>
        <h2>2. Contenuti</h2>
        <p>
          Sei responsabile di tutti i contenuti che pubblichi. Non sono ammessi contenuti
          illegali, offensivi, discriminatori o che violino i diritti di terzi.
        </p>
        <h2>3. Account</h2>
        <p>
          Sei responsabile della sicurezza del tuo account e di tutte le attività che
          avvengono con le tue credenziali.
        </p>
        <h2>4. Moderazione</h2>
        <p>
          Ci riserviamo il diritto di rimuovere contenuti o sospendere account che violano
          queste regole o le nostre{" "}
          <a href="/legal/community-guidelines">Community Guidelines</a>.
        </p>
        <h2>5. Limitazione di responsabilità</h2>
        <p>
          me&amp;who non è responsabile per i contenuti pubblicati dagli utenti né per
          eventuali danni derivanti dall&apos;utilizzo della piattaforma.
        </p>
        <p className="mt-8 text-sm text-black/55">
          Per domande: <a href="mailto:legal@meandwho.com">legal@meandwho.com</a>
        </p>
      </div>
    </div>
  );
}
