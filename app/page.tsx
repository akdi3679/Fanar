import SilkBackground from '@/components/SilkBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceLine from '@/components/ServiceLine';

export default function Page() {
  return (
    <>
      <SilkBackground />
      <Header />

      <main className="content-layer flex flex-col items-center justify-center px-6">
        {/* Nom FANAR en blanc */}
        <h1
          className="fade-in text-white text-center font-light tracking-[-0.04em] leading-none select-none"
          style={{
            fontSize: 'clamp(5rem, 20vw, 18rem)',
            textShadow: '0 0 80px rgba(255,255,255,0.08)',
          }}
        >
          Fanar
        </h1>

        <p className="fade-in-slow mt-3 text-center text-white/60 text-sm md:text-base font-light tracking-[0.3em] uppercase">
          le phare · studio web
        </p>

        {/* Une seule ligne de services avec icônes */}
        <div className="fade-in-slow mt-12 md:mt-16 w-full">
          <ServiceLine />
        </div>
      </main>
      <Footer />
    </>
  );
}