import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aiuto",
  description: "Centro assistenza di me&who. Trova risposte alle domande più comuni.",
};

const FAQ = [
  {
    q: "Come posso cambiare il paese del mio feed?",
    a: "Nella homepage trovi un filtro geografico. Puoi selezionare qualsiasi paese o vedere i post globali.",
  },
  {
    q: "Come verifico il mio account?",
    a: "La verifica è gestita manualmente dal team di me&who. Puoi richiederla scrivendo a support@meandwho.com.",
  },
  {
    q: "Come elimino il mio account?",
    a: "Vai in Impostazioni → Zona pericolosa. I tuoi dati saranno eliminati entro 30 giorni (GDPR).",
  },
  {
    q: "Come segnalo un contenuto inappropriato?",
    a: "Ogni post ha un menu '⋯' con l'opzione 'Segnala'. Oppure usa la pagina /report.",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-black mb-8">Centro assistenza</h1>
      <div className="space-y-4">
        {FAQ.map(({ q, a }) => (
          <div key={q} className="bg-white rounded-xl border border-black/6 p-5">
            <h2 className="font-semibold text-black">{q}</h2>
            <p className="text-sm text-black/55 mt-2">{a}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-black/4 rounded-xl p-5">
        <p className="text-sm text-black/70">
          Non trovi risposta?{" "}
          <a href="/feedback" className="font-medium text-black hover:underline">
            Contattaci
          </a>{" "}
          o segnala un{" "}
          <a href="/feedback/bug" className="font-medium text-black hover:underline">
            bug
          </a>.
        </p>
      </div>
    </div>
  );
}
