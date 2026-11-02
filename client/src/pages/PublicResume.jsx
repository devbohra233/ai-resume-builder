import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Copy,
  Download,
  Eye,
  Lock,
  Share2,
  Sparkles,
  Target,
} from 'lucide-react';
import { Logo } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ResumeFrame from '../components/ResumeFrame';
import ResumeDocument from '../components/ResumeDocument';
import { useToast } from '../context/ToastContext';
import { api, apiError } from '../lib/api';
import { downloadResumePdf } from '../lib/pdf';
import { filenameFromResume, formatRelative, initials } from '../lib/utils';

function PublicHeader({ views = 0 }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md no-print">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" aria-label="Vitae home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {views > 0 ? (
            <span className="hidden items-center gap-1.5 text-[11px] text-faint sm:flex">
              <Eye className="h-3.5 w-3.5" />
              {views} view{views === 1 ? '' : 's'}
            </span>
          ) : null}
          <Button as={Link} to="/register" size="sm">
            Build your resume
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function PublicLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="aspect-[794/1123] animate-pulse rounded-2xl border border-line bg-white/70 sm:rounded-3xl" />
          <div className="space-y-3">
            <div className="h-40 animate-pulse rounded-3xl border border-line bg-paper/70" />
            <div className="h-52 animate-pulse rounded-3xl border border-line bg-paper/70" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PublicResume() {
  const { slug } = useParams();
  const toast = useToast();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setResume(null);
    setError('');

    api
      .get(`/public/resumes/${slug}`)
      .then(({ data }) => {
        if (active) setResume(data.resume);
      })
      .catch((err) => {
        if (active) setError(apiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    document.title = resume
      ? `${resume.personal?.fullName || resume.title || 'Resume'} — Vitae`
      : 'Resume — Vitae';
  }, [resume]);

  const exportPdf = async () => {
    if (!resume || exporting) return;
    setExporting(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
      await downloadResumePdf(exportRef.current, filenameFromResume(resume));
      toast('PDF downloaded.');
    } catch (err) {
      toast(err?.message || 'Could not export the PDF. Try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Page link copied.');
    } catch {
      toast('Could not copy automatically. Copy the URL from the address bar.', 'error');
    }
  };

  if (loading) return <PublicLoading />;

  if (!resume) {
    return (
      <div className="min-h-screen bg-cream">
        <PublicHeader />
        <main className="mx-auto grid max-w-6xl place-items-center px-4 py-20 sm:px-6">
          <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 text-center shadow-card">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cream-deep text-forest">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="mt-4 font-display text-[30px] leading-none text-ink">
              This resume is private
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-soft">
              {error || 'This resume is private or no longer available.'} Ask the owner for a fresh
              link, or build your own in a couple of minutes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button as={Link} to="/" variant="outline">
                Back home
              </Button>
              <Button as={Link} to="/register">
                <Sparkles className="h-4 w-4" />
                Create your resume
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const personal = resume.personal || {};
  const score = typeof resume.ats?.score === 'number' ? resume.ats.score : null;

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader views={resume.views || 0} />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-5 sm:px-6 sm:pt-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-float sm:rounded-3xl">
              <ResumeFrame resume={resume} placeholder={false} />
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-faint">
              <Target className="h-3 w-3" />
              ATS-ready A4 page, rendered live from the owner’s resume
            </p>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-[88px] lg:self-start">
            <div className="rounded-3xl border border-line bg-paper p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-forest font-display text-[15px] text-lime">
                  {personal.photoUrl ? (
                    <img src={personal.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(personal.fullName)
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold tracking-tight text-ink">
                    {personal.fullName || resume.title || 'Resume'}
                  </p>
                  <p className="truncate text-[11.5px] text-faint">
                    {personal.title || 'Shared with Vitae'}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <Button variant="dark" onClick={exportPdf} loading={exporting} type="button">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={copyLink} type="button">
                  <Copy className="h-4 w-4" />
                  Copy page link
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10.5px] text-faint">
                <Share2 className="h-3 w-3" />
                Updated {formatRelative(resume.updatedAt)}
                {score !== null ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-line" />
                    ATS {score}/100
                  </>
                ) : null}
              </div>
              <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-faint">
                Contact details shown here were published by the resume owner. This page is
                read-only.
              </p>
            </div>

            <div className="rounded-3xl border border-forest/10 bg-lime-soft/60 p-5">
              <Logo size="sm" />
              <p className="mt-3 font-display text-[27px] leading-[1.02] text-forest-deep">
                Want a resume like this?
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-forest/75">
                Vitae pairs ATS-ready templates with AI drafting, live previews, and one-click
                sharing. Start from an example and make it yours.
              </p>
              <Button as={Link} to="/register" className="mt-4 w-full">
                <Sparkles className="h-4 w-4" />
                Create your resume
              </Button>
              <p className="mt-2 text-center text-[10px] text-forest/50">
                Free demo · no credit card
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-line bg-cream/70 no-print">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <Link to="/" aria-label="Vitae home">
            <Logo size="sm" />
          </Link>
          <p className="text-[11px] text-faint">
            Made with Vitae — AI resume builder for people who hate resume builders.
          </p>
        </div>
      </footer>

      <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0 no-print">
        <div ref={exportRef} style={{ width: 794, backgroundColor: '#ffffff' }}>
          <ResumeDocument resume={resume} placeholder={false} template={resume.template} />
        </div>
      </div>
    </div>
  );
}
