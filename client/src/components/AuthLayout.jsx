import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from './ui/Badge';
import ResumeFrame from './ResumeFrame';
import ScoreRing from './ScoreRing';
import { sampleResume } from '../lib/sampleResume';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Vitae home">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] text-soft transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
        <footer className="text-[11px] text-faint">© 2026 Vitae · Built with the MERN stack</footer>
      </div>

      <aside className="grain relative hidden overflow-hidden bg-forest lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-lime/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-clay/25 blur-[100px]" />

        <div className="relative flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-cream/50">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          The Vitae workspace
        </div>

        <div className="relative my-8">
          <h2 className="max-w-md font-display text-[40px] leading-[1.04] tracking-[-0.01em] text-cream xl:text-[46px]">
            Your next role deserves a <em className="italic text-lime">better first impression</em>.
          </h2>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-cream/60">
            Designed for clarity. Tuned for ATS. Exported as a pixel-perfect A4 page in one click.
          </p>

          <div className="relative mx-auto mt-10 w-[360px] xl:w-[400px]">
            <div className="relative -rotate-[2deg] rounded-2xl border border-white/15 bg-white p-1.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]">
              <ResumeFrame
                resume={sampleResume('modern', '#1f6f5c')}
                cropHeight={430}
                placeholder={false}
                className="rounded-xl"
              />
            </div>
            <div className="absolute -left-10 bottom-10 rounded-2xl border border-white/10 bg-forest-deep/90 p-3.5 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <ScoreRing value={92} size={52} stroke={5} label="" />
                <div>
                  <div className="text-[11px] font-semibold text-cream">Strong match</div>
                  <div className="text-[10px] text-cream/50">ATS scan</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 top-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10.5px] font-medium text-lime backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              Autosaving
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {[
            ['3', 'templates'],
            ['A4', 'PDF export'],
            ['AI', 'writing partner'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="font-display text-[26px] leading-none text-cream">{value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cream/40">{label}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
