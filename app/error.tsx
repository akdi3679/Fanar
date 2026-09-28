'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#00001f] text-white p-6 text-center">
      <h2 className="text-2xl font-light mb-4">Une erreur est survenue.</h2>
      <p className="text-white/60 mb-8 max-w-md">
        Nous n'avons pas pu charger cette page. Veuillez réessayer.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 border border-white/20 rounded-full text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
