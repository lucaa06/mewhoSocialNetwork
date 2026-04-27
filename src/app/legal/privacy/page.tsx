import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Come me&who raccoglie, usa e protegge i tuoi dati personali.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-black mb-8">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-black/55 text-sm mb-6">Ultimo aggiornamento: Aprile 2026</p>
        <h2>1. Titolare del trattamento</h2>
        <p>me&amp;who — email: privacy@meandwho.com</p>
        <h2>2. Dati che raccogliamo</h2>
        <ul>
          <li>Dati di registrazione (email, username, nome)</li>
          <li>Contenuti pubblicati (post, commenti, reazioni)</li>
          <li>Dati di geolocalizzazione (paese via IP, città opzionale)</li>
          <li>Dati tecnici (browser, IP, cookie di sessione)</li>
        </ul>
        <h2>3. Come usiamo i tuoi dati</h2>
        <ul>
          <li>Per fornire il servizio e personalizzare il feed</li>
          <li>Per moderare i contenuti e prevenire abusi</li>
          <li>Per inviarti notifiche (con tuo consenso)</li>
        </ul>
        <h2>4. I tuoi diritti (GDPR)</h2>
        <p>
          Hai diritto di accesso, rettifica, cancellazione, portabilità e opposizione al trattamento.
          Per esercitarli: <a href="mailto:privacy@meandwho.com">privacy@meandwho.com</a>
        </p>
        <h2>5. Conservazione dei dati</h2>
        <p>
          I dati vengono conservati per il tempo necessario alla fornitura del servizio.
          In caso di eliminazione account, i dati vengono anonimizzati entro 30 giorni.
        </p>
        <h2>6. Cookie</h2>
        <p>
          Utilizziamo solo cookie tecnici necessari al funzionamento del servizio.
          Consulta la nostra <a href="/legal/cookies">Cookie Policy</a>.
        </p>
      </div>
    </div>
  );
}
