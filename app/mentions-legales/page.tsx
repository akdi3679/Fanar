import Link from 'next/link';

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-[#00001f] text-white/80 p-8 md:p-16 max-w-3xl mx-auto font-light leading-relaxed">
      <Link href="/" className="text-white/40 hover:text-white text-sm mb-8 inline-block">← Retour</Link>
      <h1 className="text-3xl text-white mb-8 tracking-tight">Mentions Légales</h1>
      
      <section className="mb-8">
        <h2 className="text-xl text-white mb-3">Éditeur du site</h2>
        <p>Le site fanar.studio est édité par [Votre Nom / Nom de l'entreprise], dont le siège social est situé à [Votre Adresse].</p>
        <p>Email : fanar.link@gmail.com</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl text-white mb-3">Hébergeur</h2>
        <p>Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl text-white mb-3">Propriété intellectuelle</h2>
        <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.</p>
      </section>
    </main>
  );
}
