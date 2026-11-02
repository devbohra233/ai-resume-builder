import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  LayoutTemplate,
  Lock,
  LogOut,
  MoreHorizontal,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import ResumeFrame from '../components/ResumeFrame';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Dropdown from '../components/ui/Dropdown';
import Modal from '../components/ui/Modal';
import { Field, Input } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, apiError } from '../lib/api';
import { cn, formatRelative, initials } from '../lib/utils';

const TEMPLATE_OPTIONS = [
  { key: 'minimal', name: 'Minimal', hint: 'Editorial serif', accent: '#1f6f5c' },
  { key: 'modern', name: 'Modern', hint: 'Accent sidebar', accent: '#b1532f' },
  { key: 'compact', name: 'Compact', hint: 'Dense & ATS-first', accent: '#274060' },
];

function TemplateSketch({ template, accent }) {
  if (template === 'modern') {
    return (
      <div className="flex h-full w-full bg-white">
        <div className="h-full w-1/3 p-1.5" style={{ backgroundColor: accent }}>
          <div className="mx-auto mt-1 h-3 w-3 rounded-full bg-white/40" />
          <div className="mt-1.5 h-0.5 w-full rounded bg-white/30" />
          <div className="mt-1 h-0.5 w-2/3 rounded bg-white/20" />
        </div>
        <div className="flex-1 space-y-1 p-1.5">
          <div className="h-1 w-3/4 rounded bg-ink/20" />
          <div className="h-0.5 w-full rounded bg-ink/10" />
          <div className="h-0.5 w-5/6 rounded bg-ink/10" />
          <div className="h-1 w-1/3 rounded" style={{ backgroundColor: accent, opacity: 0.5 }} />
          <div className="h-0.5 w-full rounded bg-ink/10" />
        </div>
      </div>
    );
  }
  if (template === 'compact') {
    return (
      <div className="h-full w-full space-y-1 bg-white p-1.5">
        <div className="flex items-end justify-between">
          <div className="h-1.5 w-1/2 rounded bg-ink/25" />
          <div className="h-0.5 w-1/5 rounded bg-ink/10" />
        </div>
        <div className="h-0.5 w-full rounded" style={{ backgroundColor: accent, opacity: 0.6 }} />
        <div className="h-1 w-full rounded bg-cream-deep" />
        <div className="h-0.5 w-5/6 rounded bg-ink/10" />
        <div className="h-0.5 w-full rounded bg-ink/10" />
        <div className="h-1 w-full rounded bg-cream-deep" />
        <div className="h-0.5 w-4/5 rounded bg-ink/10" />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center gap-1 bg-white p-2">
      <div className="h-1.5 w-2/3 rounded bg-ink/25" />
      <div className="h-0.5 w-1/3 rounded" style={{ backgroundColor: accent, opacity: 0.6 }} />
      <div className="h-px w-full bg-line" />
      <div className="h-0.5 w-full rounded bg-ink/10" />
      <div className="h-0.5 w-5/6 rounded bg-ink/10" />
      <div className="mt-auto h-1 w-1/4 self-start rounded" style={{ backgroundColor: accent, opacity: 0.5 }} />
      <div className="h-0.5 w-full rounded bg-ink/10" />
    </div>
  );
}

function NewResumeDialog({ open, onClose, onCreated }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('modern');
  const [sample, setSample] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setTemplate('modern');
      setSample(false);
      setBusy(false);
      setError('');
    }
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/resumes', {
        title: title.trim() || undefined,
        template,
        sample,
      });
      toast(sample ? 'Example resume created. Make it yours.' : 'New resume created.');
      onCreated(data.resume);
    } catch (err) {
      setError(apiError(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New resume"
      description="Pick a starting point — everything can be changed later."
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-[11px] text-faint sm:block">
            {sample ? 'Includes realistic example content.' : 'Starts with your name and email.'}
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={submit} loading={busy} type="button">
              Create resume
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">
            {error}
          </div>
        ) : null}

        <Field label="Resume name" htmlFor="resume-title" hint="Only you see this name.">
          <Input
            id="resume-title"
            placeholder="e.g. Product Engineer — 2026"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </Field>

        <div>
          <div className="text-[13px] font-medium text-ink/85">Template</div>
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            {TEMPLATE_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setTemplate(option.key)}
                className={cn(
                  'rounded-2xl border p-2 text-left transition',
                  template === option.key
                    ? 'border-forest bg-lime-soft/40 ring-2 ring-forest/10'
                    : 'border-line bg-paper hover:border-ink/20'
                )}
                aria-pressed={template === option.key}
              >
                <div className="h-[86px] overflow-hidden rounded-lg border border-line bg-white">
                  <TemplateSketch template={option.key} accent={option.accent} />
                </div>
                <div className="mt-2 px-0.5">
                  <div className="text-[12px] font-semibold text-ink">{option.name}</div>
                  <div className="text-[10px] text-faint">{option.hint}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-cream/50 p-3.5 transition hover:border-ink/20">
          <input
            type="checkbox"
            checked={sample}
            onChange={(event) => setSample(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line accent-[#143c2f]"
          />
          <span>
            <span className="block text-[13px] font-medium text-ink">Start from example content</span>
            <span className="mt-0.5 block text-[11.5px] leading-relaxed text-faint">
              A realistic senior engineer resume, ready to edit. Great for exploring the AI tools.
            </span>
          </span>
        </label>
      </form>
    </Modal>
  );
}

function ResumeCard({ resume, busy, onOpen, onDuplicate, onDelete, onToggleVisibility, onCopyLink }) {
  const isPublic = resume.visibility === 'public';
  const score = typeof resume.ats?.score === 'number' ? resume.ats.score : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-float">
      <button
        type="button"
        onClick={onOpen}
        className="relative block w-full cursor-pointer text-left"
        aria-label={`Open ${resume.title}`}
      >
        <div className="bg-cream-deep/40 p-3">
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <ResumeFrame resume={resume} cropHeight={240} placeholder={false} />
          </div>
        </div>
        <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-t from-forest-deep/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-2 rounded-full bg-forest px-4 py-2 text-[11.5px] font-medium text-cream opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          Open editor
        </span>
      </button>

      <div className="flex flex-1 items-start justify-between gap-2 border-t border-line px-4 py-3.5">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onOpen}
            className="block max-w-[220px] truncate text-left text-[14px] font-semibold tracking-tight text-ink hover:underline"
          >
            {resume.title}
          </button>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-faint">
            <span>Edited {formatRelative(resume.lastEditedAt || resume.updatedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span className="capitalize">{resume.template}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {isPublic ? (
              <Badge tone="lime" icon={Globe}>Public</Badge>
            ) : (
              <Badge icon={Lock}>Private</Badge>
            )}
            {score !== null ? (
              <Badge tone={score >= 80 ? 'forest' : 'neutral'} icon={Target}>
                ATS {score}
              </Badge>
            ) : null}
            {typeof resume.completeness === 'number' && resume.completeness < 100 ? (
              <Badge tone="neutral">{resume.completeness}% complete</Badge>
            ) : null}
          </div>
        </div>

        <Dropdown
          align="right"
          trigger={
            <Button variant="ghost" size="icon" aria-label="Resume actions" disabled={busy}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
          items={[
            { label: 'Open editor', icon: ExternalLink, onClick: onOpen },
            { label: 'Duplicate', icon: Copy, onClick: onDuplicate, disabled: busy },
            { type: 'separator' },
            isPublic
              ? { label: 'Copy public link', icon: Copy, onClick: onCopyLink }
              : { label: 'Publish & get link', icon: Globe, onClick: onToggleVisibility, disabled: busy },
            isPublic
              ? { label: 'Make private', icon: Lock, onClick: onToggleVisibility, disabled: busy }
              : { type: 'separator' },
            { type: 'separator' },
            { label: busy ? 'Working…' : 'Delete', icon: Trash2, danger: true, onClick: onDelete, disabled: busy },
          ]}
        />
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/resumes');
      setResumes(data.resumes || []);
      setError('');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    document.title = 'Dashboard — Vitae';
  }, []);

  const stats = useMemo(() => {
    const published = resumes.filter((resume) => resume.visibility === 'public').length;
    const scored = resumes.filter((resume) => typeof resume.ats?.score === 'number');
    const avgAts = scored.length
      ? Math.round(scored.reduce((sum, resume) => sum + resume.ats.score, 0) / scored.length)
      : null;
    const strengths = resumes.filter((resume) => typeof resume.completeness === 'number');
    const avgStrength = strengths.length
      ? Math.round(strengths.reduce((sum, resume) => sum + resume.completeness, 0) / strengths.length)
      : 0;
    const latest = [...resumes].sort(
      (a, b) => new Date(b.lastEditedAt || b.updatedAt) - new Date(a.lastEditedAt || a.updatedAt)
    )[0];
    return { published, avgAts, avgStrength, latest };
  }, [resumes]);

  const filtered = useMemo(() => {
    if (filter === 'all') return resumes;
    return resumes.filter((resume) =>
      filter === 'public' ? resume.visibility === 'public' : resume.visibility !== 'public'
    );
  }, [resumes, filter]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('en', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const openResume = (resume) => navigate(`/resume/${resume.id}`);

  const duplicate = async (resume) => {
    setBusyId(resume.id);
    try {
      const { data } = await api.post(`/resumes/${resume.id}/duplicate`);
      setResumes((current) => [data.resume, ...current]);
      toast('Resume duplicated. A fresh copy is ready.');
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (resume) => {
    const confirmed = window.confirm(`Delete “${resume.title}”? This cannot be undone.`);
    if (!confirmed) return;
    setBusyId(resume.id);
    try {
      await api.delete(`/resumes/${resume.id}`);
      setResumes((current) => current.filter((item) => item.id !== resume.id));
      toast('Resume deleted.', 'info');
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = async (resume) => {
    if (!resume.slug) {
      toast('Publish this resume first to get a link.', 'info');
      return;
    }
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${resume.slug}`);
      toast('Public link copied to clipboard.');
    } catch {
      toast('Could not copy the link. You can find it in the Share panel.', 'error');
    }
  };

  const toggleVisibility = async (resume) => {
    setBusyId(resume.id);
    try {
      const action = resume.visibility === 'public' ? 'unpublish' : 'publish';
      const { data } = await api.post(`/resumes/${resume.id}/${action}`);
      setResumes((current) =>
        current.map((item) =>
          item.id === resume.id
            ? { ...item, visibility: data.resume.visibility, slug: data.resume.slug, views: data.resume.views }
            : item
        )
      );
      if (action === 'publish') {
        await navigator.clipboard
          .writeText(`${window.location.origin}/r/${data.resume.slug}`)
          .catch(() => {});
        toast('Resume published. Public link copied.');
      } else {
        toast('Resume is private again.', 'info');
      }
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const exitDemo = async () => {
    const confirmed = window.confirm('Leave the demo? Demo resumes stay behind.');
    if (!confirmed) return;
    logout();
    toast('You left the demo workspace.', 'info');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream">
      <AppHeader onNewResume={() => setNewOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        {user?.isDemo ? (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-lime/60 bg-lime-soft/60 px-4 py-3">
            <Sparkles className="h-4 w-4 text-forest" />
            <p className="flex-1 text-[12.5px] text-forest">
              You’re exploring a demo workspace. Create a real account to keep your work.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-forest/20 bg-paper/70 text-forest"
              onClick={() => {
                logout();
                navigate('/register');
              }}
            >
              Create account
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={exitDemo} className="text-forest/70 hover:bg-forest/5">
              <LogOut className="h-3.5 w-3.5" />
              Exit demo
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-faint">{today}</p>
            <h1 className="mt-2 font-display text-[38px] leading-none tracking-[-0.015em] text-ink sm:text-[46px]">
              {greeting}, {user?.name?.split(' ')[0] || 'there'}.
            </h1>
            <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-soft">
              {resumes.length
                ? 'Your workspace is up to date. Pick a resume to refine, or start something new.'
                : 'Your workspace is ready. Start with an example or a blank page.'}
            </p>
          </div>
          <Button onClick={() => setNewOpen(true)} size="lg" className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
            New resume
          </Button>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-paper p-4 shadow-card">
            <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">
              <FileText className="h-3.5 w-3.5" /> Resumes
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-display text-[32px] leading-none text-ink">{resumes.length}</span>
              <span className="text-[11px] text-faint">{stats.published} public</span>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-4 shadow-card">
            <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">
              <Target className="h-3.5 w-3.5" /> Avg ATS score
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-display text-[32px] leading-none text-ink">
                {stats.avgAts ?? '—'}
              </span>
              <span className="text-[11px] text-faint">
                {stats.avgAts === null ? 'Run a check' : stats.avgAts >= 80 ? 'Strong' : 'Room to grow'}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-4 shadow-card">
            <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">
              <Clock className="h-3.5 w-3.5" /> Latest edit
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="truncate pr-2 text-[15px] font-semibold text-ink">
                {stats.latest ? stats.latest.title : 'No resumes yet'}
              </span>
              <span className="text-[11px] text-faint">
                {stats.latest ? formatRelative(stats.latest.lastEditedAt || stats.latest.updatedAt) : '—'}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream-deep">
              <div
                className="h-full rounded-full bg-forest transition-all duration-500"
                style={{ width: `${stats.avgStrength || 4}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[16px] font-semibold tracking-tight text-ink">Your resumes</h2>
              <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[10.5px] font-medium text-soft">
                {resumes.length}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1">
              {[
                ['all', 'All'],
                ['private', 'Private'],
                ['public', 'Public'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition',
                    filter === key ? 'bg-forest text-cream' : 'text-soft hover:bg-cream'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
              <span className="flex-1">{error}</span>
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-[360px] animate-pulse rounded-3xl border border-line bg-paper/70" />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className="group flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-ink/15 bg-paper/40 p-6 text-center transition hover:border-forest/40 hover:bg-paper"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-lime transition group-hover:scale-105">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="mt-4 text-[14px] font-semibold text-ink">Start a new resume</span>
                <span className="mt-1 max-w-[220px] text-[11.5px] leading-relaxed text-faint">
                  Blank page or example content — both include AI writing and ATS checks.
                </span>
              </button>

              {filtered.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  busy={busyId === resume.id}
                  onOpen={() => openResume(resume)}
                  onDuplicate={() => duplicate(resume)}
                  onDelete={() => remove(resume)}
                  onToggleVisibility={() => toggleVisibility(resume)}
                  onCopyLink={() => copyLink(resume)}
                />
              ))}
            </div>
          )}

          {!loading && resumes.length > 0 && filtered.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-line bg-paper/50 px-6 py-12 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-cream-deep text-forest">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[14px] font-medium text-ink">No {filter} resumes</p>
              <p className="mt-1 text-[12px] text-faint">
                Switch the filter or publish a resume to share it publicly.
              </p>
            </div>
          ) : null}
        </section>

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-forest font-display text-[12px] text-lime">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(user?.name)
              )}
            </span>
            <div>
              <p className="text-[12.5px] font-medium text-ink">{user?.name}</p>
              <p className="text-[11px] text-faint">{user?.email}</p>
            </div>
          </div>
          <p className="text-[11px] text-faint">
            Tip: run an ATS check every time you tailor a resume to a job post.
          </p>
        </section>
      </main>

      <NewResumeDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(resume) => {
          setNewOpen(false);
          navigate(`/resume/${resume.id}`);
        }}
      />
    </div>
  );
}
