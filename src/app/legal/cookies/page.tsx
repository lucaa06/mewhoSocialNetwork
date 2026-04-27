import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-black mb-8">Cookie Policy</h1>
      <div className="prose prose-gray max-w-none">
        <p>
          me&amp;who utilizza esclusivamente cookie tecnici necessari al funzionamento del
          servizio. Non utilizziamo cookie di profilazione o tracciamento di terze parti.
        </p>
        <h2>Cookie utilizzati</h2>
        <table>
          <thead>
            <tr><th>Nome</th><th>Scopo</th><th>Durata</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>sb-*</code></td>
              <td>Sessione di autenticazione Supabase</td>
              <td>Sessione / 7 giorni</td>
            </tr>
          </tbody>
        </table>
        <p>
          Per eliminare i cookie puoi usare le impostazioni del tuo browser.
          L&apos;eliminazione dei cookie di sessione comporta la disconnessione dall&apos;account.
        </p>
      </div>
    </div>
  );
}
