import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "Le regole della community di me&who per un ambiente sano e rispettoso.",
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-black mb-8">Community Guidelines</h1>
      <div className="prose prose-gray max-w-none">
        <p>
          me&amp;who è un posto per idee, progetti e connessioni. Per mantenerlo sano:
        </p>
        <h2>Cosa è vietato</h2>
        <ul>
          <li>Contenuti illegali o che violano leggi vigenti</li>
          <li>Odio, discriminazione, molestie o bullismo</li>
          <li>Spam, contenuti ripetitivi o promozionali non pertinenti</li>
          <li>Disinformazione deliberata</li>
          <li>Impersonificazione di altri utenti o enti</li>
          <li>Contenuti sessualmente espliciti non consenzienti</li>
        </ul>
        <h2>Cosa incoraggiamo</h2>
        <ul>
          <li>Condivisione di idee autentiche</li>
          <li>Collaborazione e costruzione di reti</li>
          <li>Feedback costruttivo e rispettoso</li>
          <li>Diversità di background e prospettive</li>
        </ul>
        <h2>Moderazione</h2>
        <p>
          Il team di moderazione interviene su segnalazione o automaticamente.
          Le decisioni di moderazione possono essere contestate scrivendo a{" "}
          <a href="mailto:moderation@meandwho.com">moderation@meandwho.com</a>.
        </p>
      </div>
    </div>
  );
}
