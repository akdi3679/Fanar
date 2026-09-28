import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#00001f] text-white p-6 text-center">
      <h2 className="text-4xl font-light mb-4">404</h2>
      <p className="text-white/60 mb-8">Page introuvable.</p>
      <Link
        href="/"
        className="px-6 py-3 border border-white/20 rounded-full text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
