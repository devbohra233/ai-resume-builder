import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  Menu,
  Share2,
  Sparkles,
  Target,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiError } from '../lib/api';
import { sampleResume } from '../lib/sampleResume';
import ResumeFrame from '../components/ResumeFrame';
import ScoreRing from '../components/ScoreRing';
import Button from '../components/ui/Button';
import Badge, { Logo } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const TEMPLATES = [
  {
    key: 'minimal',
    name: 'Minimal',
    tagline: 'Editorial serif, hiring-manager approved.',
    accent: '#1f6f5c',
  },
  {
    key: 'modern',
    name: 'Modern',
    tagline: 'A bold sidebar that puts your story first.',
    accent: '#b1532f',
  },
  {
    key: 'compact',
    name: 'Compact',
    tagline: 'Dense, scannable, built for ATS.',
    accent: '#274060',
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI that writes like you',
    body: 'Draft summaries, rewrite bullets, and surface skills from a single prompt. Your facts stay yours.',
  },
  {
    icon: Target,
    title: 'ATS score in seconds',
    body: 'Paste a job description and see the keywords you match — and the ones to add.',
  },
  {
    icon: ImageIcon,
    title: 'Photo uploads via ImageKit',
    body: 'Upload once and ImageKit serves an optimized, face-cropped image on every resume.',
  },
  {
    icon: FileText,
    title: 'True A4 live preview',
    body: 'Every edit renders on a pixel-accurate page. No surprises when you open the PDF.',
  },
  {
    icon: Download,
    title: 'One-click PDF export',
    body: 'Client-side rasterization with automatic pagination. Crisp, shareable, print-ready.',
  },
  {
    icon: Share2,
    title: 'Shareable public links',
    body: 'Publish a live resume page with one toggle. Take it down just as fast.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Start from your story',
    body: 'Create a blank page, or borrow the example resume and make it yours.',
  },
  {
    number: '02',
    title: 'Polish with AI',
    body: 'Let Vitae tighten your summary, quantify bullets, and suggest the right skills.',
  },
  {
    number: '03',
    title: 'Export and share',
    body: 'Download an A4 PDF or send a live link that always reflects the latest edit.',
  },
];

export default function Landing() {
  const { user, startDemo } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'Vitae — AI resume builder';
  }, []);

  const heroResume = sampleResume('modern', '#1f6f5c');

  const runDemo = async () => {
    if (user) {
      navigate('/dashboard');
      return;
    }
    setDemoLoading(true);
    try {
      await startDemo();
      toast('Demo workspace ready. Explore freely.', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(apiError(err), 'error');
      setDemoLoading(false);
    }
  };

  const primaryTo = user ? '/dashboard' : '/register';
  const primaryLabel = user ? 'Open dashboard' : 'Build my resume';

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <header className="sticky top-0 z-50 border-b border-line/60 bg-cream/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" aria-label="Vitae home">
            <Logo />
          </Link>
          <nav className="ml-4 hidden items-center gap-7 text-[13.5px] font-medium text-soft lg:flex">
            <a href="#features" className="transition hover:text-ink">Features</a>
            <a href="#templates" className="transition hover:text-ink">Templates</a>
            <a href="#how" className="transition hover:text-ink">How it works</a>
            <a href="#ai" className="transition hover:text-ink">AI</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <Button as={Link} to="/dashboard" size="sm">
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign in
                </Button>
                <Button as={Link} to="/register" size="sm">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <button
              type="button"
              className="ml-1 rounded-lg p-2 text-ink/70 transition hover:bg-ink/5 lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="border-t border-line bg-cream px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-medium text-soft">
              {[
                ['Features', '#features'],
                ['Templates', '#templates'],
                ['How it works', '#how'],
                ['AI writing', '#ai'],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 transition hover:bg-paper"
                >
                  {label}
                </a>
              ))}
              {!user ? (
                <Link to="/login" className="rounded-xl px-3 py-2.5 transition hover:bg-paper">
                  Sign in
                </Link>
              ) : null}
            </nav>
          </div>
        ) : null}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-lime/40 blur-[100px]" />
        <div className="pointer-events-none absolute -left-40 top-64 h-[420px] w-[420px] rounded-full bg-clay/10 blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-[11.5px] font-medium text-soft shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss" />
              </span>
              AI resume builder · MERN + ImageKit
            </div>

            <h1 className="mt-6 text-balance font-display text-[54px] leading-[0.94] tracking-[-0.02em] text-ink sm:text-[68px] lg:text-[78px]">
              Your experience,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 italic text-forest">beautifully told.</span>
                <span className="absolute inset-x-0 bottom-[0.08em] z-0 h-[0.28em] -rotate-[0.8deg] bg-lime" />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-soft sm:text-base">
              Vitae turns your work history into an interview-ready resume — with an AI writing
              partner, pixel-accurate A4 preview, ATS scoring, ImageKit-hosted photos, and a PDF
              that actually looks like your screen.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button as={Link} to={primaryTo} size="lg" className="group">
                {primaryLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={runDemo}
                loading={demoLoading}
                className="bg-paper/70"
              >
                {demoLoading ? 'Preparing workspace…' : 'Try the live demo'}
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-faint">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-moss" /> No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-moss" /> Instant PDF
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-moss" /> Your data, editable
              </span>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ['12k+', 'resumes crafted'],
                ['92', 'avg ATS score'],
                ['60s', 'to a first draft'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-display text-[28px] leading-none text-ink">{value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.13em] text-faint">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px] animate-rise-slow delay-200 lg:max-w-none">
            <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-lime/30 blur-2xl" />
            <div className="relative mx-auto w-[88%] -rotate-[2.4deg] rounded-[20px] border border-line bg-white p-1.5 shadow-float transition-transform duration-500 hover:rotate-0">
              <ResumeFrame
                resume={heroResume}
                cropHeight={540}
                placeholder={false}
                className="rounded-[14px]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-black/[0.04]" />
            </div>

            <div className="absolute -left-2 top-16 hidden w-[196px] rounded-2xl border border-line bg-paper/95 p-3.5 shadow-card backdrop-blur animate-float sm:block">
              <div className="flex items-center gap-3">
                <ScoreRing value={92} size={58} stroke={5} label="" />
                <div>
                  <div className="text-[11px] font-semibold text-ink">Strong match</div>
                  <div className="mt-0.5 text-[10px] leading-snug text-faint">ATS scan vs. job post</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 top-[46%] hidden w-[210px] rounded-2xl border border-line bg-forest p-3.5 text-cream shadow-float animate-float delay-300 sm:block">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-lime">
                <Wand2 className="h-3.5 w-3.5" /> AI rewrite
              </div>
              <p className="mt-2 text-[11.5px] leading-snug text-cream/85">
                “Lifting conversion by 18% and reducing support tickets by 32%.”
              </p>
            </div>

            <div className="absolute -bottom-5 left-10 rounded-full border border-line bg-paper px-4 py-2 shadow-card">
              <span className="flex items-center gap-2 text-[11px] font-medium text-ink/80">
                <Download className="h-3.5 w-3.5 text-moss" /> PDF ready · A4
              </span>
            </div>
          </div>
        </div>

        <div className="relative border-y border-line/70 bg-paper/50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-faint sm:px-6">
            <span>MongoDB</span>
            <span>Express</span>
            <span>React</span>
            <span>Node.js</span>
            <span>ImageKit</span>
            <span>Ollama / OpenAI</span>
            <span className="hidden sm:inline">Built for the MERN stack</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">Features</p>
          <h2 className="mt-3 text-balance font-display text-[42px] leading-[1.02] tracking-[-0.01em] sm:text-5xl">
            Everything between you and the <em className="italic text-forest">offer</em>.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-soft">
            A focused editor, not a form graveyard. Each feature exists to get your strongest
            evidence onto one page, fast.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border border-line bg-paper p-6 shadow-card md:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-md">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-lime">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[19px] font-semibold tracking-tight text-ink">AI that writes like you</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-soft">
                  Generate a summary, turn responsibilities into evidence, and tighten every line.
                  Works with any OpenAI-compatible model, or a local Ollama model.
                </p>
              </div>
              <Badge tone="lime">Demo uses local AI</Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-cream/60 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">Before</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-soft line-through decoration-clay/40 decoration-1">
                  Responsible for various frontend tasks and helping the team ship features.
                </p>
              </div>
              <div className="relative rounded-2xl border border-forest/15 bg-lime-soft/60 p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                  <Wand2 className="h-3 w-3" /> After
                </div>
                <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-forest">
                  Rebuilt checkout in React and Node.js, lifting conversion 18% and cutting support
                  tickets 32%.
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-16 -right-10 h-44 w-44 rounded-full bg-lime/30 blur-2xl transition group-hover:bg-lime/50" />
          </div>

          <div className="rounded-3xl border border-line bg-paper p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-cream-deep text-forest">
                <Target className="h-5 w-5" />
              </div>
              <ScoreRing value={92} size={72} stroke={6} label="" />
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">ATS score</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-soft">
              Keyword coverage, structure checks, and fixes — measured against the job you want.
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-paper p-6 shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cream-deep text-forest">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">ImageKit photos</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-soft">
              Server-side uploads with automatic face crop and CDN delivery. No keys? Photos fall
              back to local disk.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-forest font-display text-[13px] text-lime">
                JE
              </div>
              <div className="text-[11px] text-faint">tr:w-600,h-600,fo-face</div>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-paper p-6 shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cream-deep text-forest">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">Live A4 preview</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-soft">
              Every keystroke rendered at 794 × 1123 px. What you see is the PDF you get.
            </p>
            <div className="mt-4 rounded-xl border border-line bg-cream/70 p-2">
              <ResumeFrame
                resume={sampleResume('minimal')}
                cropHeight={104}
                placeholder={false}
                className="rounded-md"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-forest bg-forest p-6 text-cream shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lime">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-cream">Share links</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-cream/70">
              Publish to a clean, mobile-friendly page. Unpublish without losing the link.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[11px] text-cream/70">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              vitae.app/r/jordan-ellis
              <span className="ml-auto text-[10px] text-cream/40">Copy</span>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime/20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="border-y border-line/70 bg-cream-deep/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">Templates</p>
              <h2 className="mt-3 font-display text-[42px] leading-[1.02] tracking-[-0.01em] sm:text-5xl">
                Three ways to be <em className="italic text-forest">memorable</em>.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-soft">
                Switch templates anytime. Your content and accent color follow you.
              </p>
            </div>
            <Button as={Link} to={primaryTo} variant="outline" className="bg-paper/70">
              Start with any template
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TEMPLATES.map((template, index) => (
              <div key={template.key} className="group">
                <div className="relative overflow-hidden rounded-3xl border border-line bg-paper p-3 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-float">
                  <div className="overflow-hidden rounded-2xl bg-cream">
                    <ResumeFrame
                      resume={sampleResume(template.key, template.accent)}
                      cropHeight={340}
                      placeholder={false}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-forest px-4 py-2 text-[11px] font-medium text-cream shadow-lg">
                      Preview in editor
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-ink">
                      {template.name}
                      <span className="ml-2 text-[11px] font-normal text-faint">0{index + 1}</span>
                    </h3>
                    <p className="mt-0.5 text-[12px] text-soft">{template.tagline}</p>
                  </div>
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: template.accent }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">How it works</p>
            <h2 className="mt-3 font-display text-[42px] leading-[1.02] tracking-[-0.01em] sm:text-5xl">
              From blank page to <em className="italic text-forest">interview</em>.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-soft">
              The whole flow is one workspace: write on the left, watch the page take shape on the
              right, and export when it feels right.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge tone="forest" icon={Zap}>Autosave</Badge>
              <Badge tone="neutral" icon={FileText}>A4 PDF</Badge>
              <Badge tone="neutral" icon={Share2}>Public link</Badge>
            </div>
          </div>

          <div className="divide-y divide-line rounded-3xl border border-line bg-paper shadow-card">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-6 p-6 sm:p-8">
                <div className="font-display text-[46px] leading-none text-lime [text-shadow:0_1px_0_#c9e23d]">
                  {step.number}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-[17px] font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-soft">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI dark panel */}
      <section id="ai" className="px-4 pb-20 sm:px-6 lg:pb-28">
        <div className="grain relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-forest px-6 py-14 text-cream sm:px-10 lg:px-14 lg:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lime/20 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-clay/20 blur-[100px]" />
          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-lime">
                <Sparkles className="h-3.5 w-3.5" /> AI writing partner
              </div>
              <h2 className="mt-5 text-balance font-display text-[40px] leading-[1.03] tracking-[-0.01em] sm:text-5xl">
                A senior writer, sitting next to your <em className="italic text-lime">draft</em>.
              </h2>
              <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-cream/70">
                Bring your own OpenAI-compatible key for frontier models, or run locally with
                Ollama. No key configured? A built-in draft engine keeps the workflow moving.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'Summary generation from role, years, and skills',
                  'Bullet rewriting with strong verbs and metrics',
                  'Skill suggestions tuned to the role',
                  'Job-description keyword matching and ATS checks',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-cream/85">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-lime">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="lime" as={Link} to={primaryTo}>
                  Try it free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <span className="text-[11px] text-cream/40">No key required for the demo</span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/12 bg-white/[0.045] p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-cream/45">
                  <span>Summary draft</span>
                  <span className="flex items-center gap-1.5 text-lime">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime" /> generated
                  </span>
                </div>
                <div className="mt-4 rounded-2xl bg-paper p-5 text-ink shadow-float">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-moss">
                    Professional summary
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink/85">
                    Senior product engineer with 8+ years of experience building fast, accessible
                    web products end to end. Led cross-functional teams to ship features used by
                    2M+ people and cut page-load times by 45%. Known for strong ownership and clear
                    communication.
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                    <span className="rounded-full bg-lime-soft px-2 py-0.5 text-[10px] font-medium text-forest">
                      Local AI
                    </span>
                    <span className="text-[10px] text-faint">Review facts before sending</span>
                    <span className="ml-auto text-[10px] font-medium text-forest">Insert →</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Tighten wording', 'Add metrics', 'Suggest skills', 'Improve flow'].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-[10.5px] text-cream/60"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[36px] border border-line bg-lime p-8 sm:p-14">
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/70">
                <FileText className="h-3.5 w-3.5" /> Your next chapter
              </div>
              <h2 className="mt-4 text-balance font-display text-[44px] leading-[0.98] tracking-[-0.015em] text-forest-deep sm:text-6xl">
                Make the page <em className="italic">yours</em>.
              </h2>
              <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-forest/75">
                Open a blank resume, borrow the example, or jump into the demo workspace. You can
                be exporting a polished A4 PDF in under a minute.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button as={Link} to={primaryTo} size="lg" variant="dark">
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={runDemo}
                loading={demoLoading}
                className="border-forest/20 bg-white/40 text-forest hover:bg-white/60"
              >
                Explore the demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-faint">
              An AI resume builder built with MongoDB, Express, React, Node.js and ImageKit.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-[12.5px] text-soft">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#templates" className="hover:text-ink">Templates</a>
            <a href="#ai" className="hover:text-ink">AI</a>
            <Link to="/login" className="hover:text-ink">Sign in</Link>
            <Link to="/register" className="hover:text-ink">Create account</Link>
          </div>
          <p className="text-[11px] text-faint">© 2026 Vitae. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
