import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Logo } from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — Vitae';
  }, []);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-cream px-4 no-print">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative w-full max-w-lg text-center">
        <Link to="/" className="mb-9 inline-flex" aria-label="Vitae home">
          <Logo size="lg" />
        </Link>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-faint">
          404 · page not found
        </p>
        <h1 className="mt-3 font-display text-[clamp(42px,9vw,68px)] leading-[0.94] tracking-[-0.02em] text-ink">
          This page took a different path.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[13.5px] leading-relaxed text-soft">
          The link may be broken, or the resume you are looking for was unpublished by its owner.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Button as={Link} to="/">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Button>
          <Button as={Link} to="/dashboard" variant="outline">
            <LayoutDashboard className="h-4 w-4" />
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
