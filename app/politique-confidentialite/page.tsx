import Link from 'next/link';

export default function PolitiqueConfidentialite() {
  return (
    <main className="min-h-screen bg-[#00001f] text-white/80 p-8 md:p-16 max-w-3xl mx-auto font-light leading-relaxed">
      <Link href="/" className="text-white/40 hover:text-white text-sm mb-8 inline-block">← Retour</Link>
      <h1 className="text-3xl text-white mb-8 tracking-tight">Politique de Confidentialité</h1>
      
      <section className="mb-8">
        <p>Fanar Studio s'engage à protéger votre vie privée. Cette politique explique comment nous traitons vos données.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl text-white mb-3">Données collectées</h2>
        <p>Nous ne collectons aucune donnée personnelle sans votre consentement. Si vous nous contactez par email, nous conservons uniquement les informations nécessaires pour répondre à votre demande.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl text-white mb-3">Mesure d'audience</h2>
        <p>Nous utilisons Plausible Analytics, un outil de mesure d'audience respectueux de la vie privée qui ne dépose aucun cookie et ne collecte aucune donnée personnelle identifiable.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl text-white mb-3">Vos droits</h2>
        <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à fanar.link@gmail.com.</p>
      </section>
    </main>
  );
}
