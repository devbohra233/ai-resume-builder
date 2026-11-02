import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Briefcase,
  Check,
  Copy,
  Loader2,
  PenLine,
  Plus,
  RefreshCw,
  Sparkles,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { useToast } from '../../context/ToastContext';
import { api, apiError } from '../../lib/api';
import { cn } from '../../lib/utils';

const TABS = [
  { key: 'summary', label: 'Summary', icon: PenLine },
  { key: 'bullets', label: 'Bullets', icon: Briefcase },
  { key: 'skills', label: 'Skills', icon: Zap },
  { key: 'polish', label: 'Polish', icon: Wand2 },
];

function providerLabel(provider) {
  if (!provider) return 'AI';
  if (provider.startsWith('ollama:')) return `Ollama · ${provider.split(':')[1] || 'local'}`;
  if (provider === 'builtin') return 'Built-in writer';
  return provider;
}

function DraftShell({ children, provider, footer }) {
  return (
    <div className="mt-4 animate-pop rounded-2xl border border-forest/15 bg-lime-soft/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/60">AI draft</span>
        <span className="rounded-full bg-paper/80 px-2 py-0.5 text-[9.5px] font-medium text-forest/70">
          {providerLabel(provider)}
        </span>
      </div>
      {children}
      {footer ? <div className="mt-3 flex flex-wrap gap-2 border-t border-forest/10 pt-3">{footer}</div> : null}
    </div>
  );
}

function LoadingDraft({ label = 'Drafting with AI…' }) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-cream/40 p-4">
      <div className="flex items-center gap-2 text-[12px] font-medium text-soft">
        <Loader2 className="h-4 w-4 animate-spin text-forest" />
        {label}
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-full animate-pulse rounded bg-line/70" />
        <div className="h-2.5 w-11/12 animate-pulse rounded bg-line/60" />
        <div className="h-2.5 w-3/4 animate-pulse rounded bg-line/50" />
      </div>
      <p className="mt-3 text-[10.5px] text-faint">
        Local models can take 10–20 seconds on the first run. You can keep editing on the left.
      </p>
    </div>
  );
}

export default function AIDrawer({
  open,
  onClose,
  initialTab = 'summary',
  context = null,
  resume,
  aiStatus,
  onUseSummary,
  onInsertBullets,
  onAddSkills,
  onReplaceText,
}) {
  const toast = useToast();
  const [tab, setTab] = useState(initialTab);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(() => new Set());

  const [role, setRole] = useState('');
  const [years, setYears] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [highlights, setHighlights] = useState('');

  const experiences = resume?.experience || [];
  const [expIndex, setExpIndex] = useState(0);
  const [bulletRole, setBulletRole] = useState('');
  const [bulletCompany, setBulletCompany] = useState('');
  const [bulletContext, setBulletContext] = useState('');
  const [bulletCount, setBulletCount] = useState(4);

  const [skillRole, setSkillRole] = useState('');

  const [polishText, setPolishText] = useState('');

  useEffect(() => {
    if (!open) return;
    setTab(initialTab || 'summary');
    setResult(null);
    setError('');
    setBusy(false);
    setAdded(new Set());

    const p = resume?.personal || {};
    const index = context?.experienceIndex ?? 0;
    const exp = experiences[index] || experiences[0];
    setRole(p.title || '');
    setYears('');
    setSkillsText((resume?.skills || []).join(', '));
    setHighlights('');
    setExpIndex(exp ? experiences.indexOf(exp) : 0);
    setBulletRole(exp?.role || p.title || '');
    setBulletCompany(exp?.company || '');
    setBulletContext((exp?.bullets || []).filter(Boolean).join(' ').slice(0, 900));
    setBulletCount(4);
    setSkillRole(p.title || '');
    setPolishText(context?.text || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTab, context]);

  const chooseExperience = (index) => {
    setExpIndex(index);
    const exp = experiences[index];
    setBulletRole(exp?.role || resume?.personal?.title || '');
    setBulletCompany(exp?.company || '');
    setBulletContext((exp?.bullets || []).filter(Boolean).join(' ').slice(0, 900));
    setResult(null);
    setError('');
  };

  const run = async (endpoint, payload) => {
    setBusy(true);
    setError('');
    setResult(null);
    setAdded(new Set());
    try {
      const { data } = await api.post(`/ai/${endpoint}`, payload);
      setResult(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const generateSummary = () =>
    run('summary', {
      role,
      years,
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12),
      highlights,
    });

  const generateBullets = () =>
    run('bullets', {
      role: bulletRole,
      company: bulletCompany,
      description: bulletContext,
      count: Number(bulletCount) || 4,
    });

  const generateSkills = () =>
    run('skills', {
      role: skillRole,
      existing: resume?.skills || [],
    });

  const improve = () => {
    if (polishText.trim().length < 10) {
      setError('Add a little more text to improve.');
      return;
    }
    run('improve', { text: polishText });
  };

  const addOneBullet = (bullet) => {
    onInsertBullets?.(expIndex, [bullet]);
    setAdded((current) => new Set(current).add(bullet));
  };

  const addAllBullets = () => {
    if (!result?.bullets?.length) return;
    onInsertBullets?.(expIndex, result.bullets);
    onClose?.();
  };

  const toggleSkill = (skill) => {
    setAdded((current) => {
      const next = new Set(current);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const addSelectedSkills = () => {
    const skills = result?.skills?.filter((skill) => added.has(skill)) || [];
    if (!skills.length) {
      toast('Select at least one skill first.', 'info');
      return;
    }
    onAddSkills?.(skills);
    toast(`${skills.length} skill${skills.length === 1 ? '' : 's'} added to your resume.`);
    onClose?.();
  };

  const copyResult = async () => {
    const text = result?.text || result?.summary || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard.');
    } catch {
      toast('Could not copy to clipboard.', 'error');
    }
  };

  const insertPoly = () => {
    if (!result?.text) return;
    onReplaceText?.(result.text);
    onClose?.();
  };

  const builtin = result?.provider === 'builtin';
  const polishTargetLabel =
    context?.target === 'bullet'
      ? 'Experience bullet'
      : context?.target === 'summary'
        ? 'Professional summary'
        : 'Selected text';

  const selectedCount = useMemo(
    () => (result?.skills || []).filter((skill) => added.has(skill)).length,
    [result, added]
  );

  if (!open) return null;

  return createPortal(
    <div className="no-print fixed inset-0 z-[130]">
      <button
        type="button"
        aria-label="Close AI assistant"
        className="absolute inset-0 cursor-default bg-forest-deep/45 backdrop-blur-[3px] animate-fade"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="AI assistant"
        className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col border-l border-line bg-paper shadow-float animate-slide-in"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-forest-deep">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight text-ink">AI assistant</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                {aiStatus ? `${aiStatus.label} · ${aiStatus.model}` : 'Checking model…'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-soft transition hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="border-b border-line px-3 py-2">
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-cream/60 p-1">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key);
                  setResult(null);
                  setError('');
                  setBusy(false);
                  if (item.key === 'polish' && !polishText) {
                    setPolishText(context?.text || resume?.personal?.summary || '');
                  }
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11.5px] font-medium transition',
                  tab === item.key ? 'bg-paper text-forest shadow-sm' : 'text-soft hover:text-ink'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {error ? (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {tab === 'summary' && (
            <div className="animate-fade">
              <h3 className="text-[14px] font-semibold text-ink">Generate a professional summary</h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
                Pulls from your target role, experience level, and skill list. Edit the result before using it.
              </p>
              <div className="mt-4 space-y-3">
                <Field label="Target role">
                  <Input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Senior Product Engineer" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Years of experience">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={years}
                      onChange={(event) => setYears(event.target.value)}
                      placeholder="8"
                    />
                  </Field>
                  <Field label="Tone">
                    <Select defaultValue="confident">
                      <option value="confident">Confident</option>
                      <option value="warm">Warm</option>
                      <option value="technical">Technical</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Top skills" hint="Comma separated.">
                  <Input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} />
                </Field>
                <Field label="Highlights to include" hint="Optional wins, scope, or specialization.">
                  <Textarea
                    rows={3}
                    value={highlights}
                    onChange={(event) => setHighlights(event.target.value)}
                    placeholder="Cut load times 45%, led a team of six, owns design systems"
                  />
                </Field>
                <Button className="w-full" onClick={generateSummary} loading={busy} type="button">
                  <Sparkles className="h-4 w-4" />
                  {result ? 'Regenerate summary' : 'Generate summary'}
                </Button>
              </div>

              {busy ? <LoadingDraft label="Writing your summary…" /> : null}
              {result?.summary && !busy ? (
                <DraftShell
                  provider={result.provider}
                  footer={
                    <>
                      <Button size="sm" onClick={() => { onUseSummary?.(result.summary); onClose?.(); }} type="button">
                        <Check className="h-3.5 w-3.5" />
                        Use this summary
                      </Button>
                      <Button size="sm" variant="outline" onClick={generateSummary} type="button">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try again
                      </Button>
                      <Button size="sm" variant="ghost" onClick={copyResult} type="button">
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </>
                  }
                >
                  <p className="text-[13px] leading-relaxed text-ink/85">{result.summary}</p>
                  {builtin ? (
                    <p className="mt-2 text-[10px] text-forest/60">
                      Built-in draft. Connect a model for richer wording.
                    </p>
                  ) : null}
                </DraftShell>
              ) : null}
            </div>
          )}

          {tab === 'bullets' && (
            <div className="animate-fade">
              <h3 className="text-[14px] font-semibold text-ink">Turn work into evidence</h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
                Choose a role, add context, and generate bullets with strong verbs.
              </p>

              {experiences.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-line bg-cream/30 p-5 text-center">
                  <p className="text-[12.5px] font-medium text-ink">Add a role first</p>
                  <p className="mt-1 text-[11px] text-faint">
                    Close this panel and add an experience entry, then come back.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 space-y-3">
                    <Field label="Target role">
                      <Select value={expIndex} onChange={(event) => chooseExperience(Number(event.target.value))}>
                        {experiences.map((exp, index) => (
                          <option key={exp.id} value={index}>
                            {[exp.role || 'Untitled role', exp.company].filter(Boolean).join(' · ') ||
                              `Role ${index + 1}`}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Role title">
                        <Input value={bulletRole} onChange={(event) => setBulletRole(event.target.value)} />
                      </Field>
                      <Field label="Company">
                        <Input value={bulletCompany} onChange={(event) => setBulletCompany(event.target.value)} />
                      </Field>
                    </div>
                    <Field label="Context" hint="What did you build or own? Include numbers if you have them.">
                      <Textarea
                        rows={4}
                        value={bulletContext}
                        onChange={(event) => setBulletContext(event.target.value)}
                        placeholder="Rebuilt checkout in React and Node, led 6 engineers, improved conversion"
                      />
                    </Field>
                    <div className="flex items-end gap-3">
                      <Field label="Bullets" className="w-[130px]">
                        <Select value={bulletCount} onChange={(event) => setBulletCount(Number(event.target.value))}>
                          {[3, 4, 5, 6].map((count) => (
                            <option key={count} value={count}>
                              {count} bullets
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Button className="flex-1" onClick={generateBullets} loading={busy} type="button">
                        <Sparkles className="h-4 w-4" />
                        Generate bullets
                      </Button>
                    </div>
                  </div>

                  {busy ? <LoadingDraft label="Drafting impact bullets…" /> : null}
                  {result?.bullets?.length && !busy ? (
                    <DraftShell
                      provider={result.provider}
                      footer={
                        <>
                          <Button size="sm" onClick={addAllBullets} type="button">
                            <Plus className="h-3.5 w-3.5" />
                            Insert all {result.bullets.length}
                          </Button>
                          <Button size="sm" variant="outline" onClick={generateBullets} type="button">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Try again
                          </Button>
                        </>
                      }
                    >
                      <ul className="space-y-2">
                        {result.bullets.map((bullet, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 rounded-xl border border-forest/10 bg-paper/70 px-3 py-2.5"
                          >
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-forest/40" />
                            <span className="flex-1 text-[12.5px] leading-relaxed text-ink/85">{bullet}</span>
                            <button
                              type="button"
                              onClick={() => addOneBullet(bullet)}
                              disabled={added.has(bullet)}
                              className={cn(
                                'mt-0.5 rounded-md p-1 transition',
                                added.has(bullet)
                                  ? 'text-moss'
                                  : 'text-faint hover:bg-lime-soft hover:text-forest'
                              )}
                              aria-label={added.has(bullet) ? 'Bullet added' : 'Add bullet'}
                            >
                              {added.has(bullet) ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </DraftShell>
                  ) : null}
                </>
              )}
            </div>
          )}

          {tab === 'skills' && (
            <div className="animate-fade">
              <h3 className="text-[14px] font-semibold text-ink">Skills that fit the role</h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
                Suggestions exclude what you already have. Add only skills you can defend in an interview.
              </p>
              <div className="mt-4 space-y-3">
                <Field label="Role">
                  <Input value={skillRole} onChange={(event) => setSkillRole(event.target.value)} placeholder="Frontend Engineer" />
                </Field>
                <Button className="w-full" onClick={generateSkills} loading={busy} type="button">
                  <Sparkles className="h-4 w-4" />
                  Suggest skills
                </Button>
              </div>

              {busy ? <LoadingDraft label="Scanning the role…" /> : null}
              {result?.skills?.length && !busy ? (
                <DraftShell
                  provider={result.provider}
                  footer={
                    <>
                      <Button size="sm" onClick={addSelectedSkills} type="button" disabled={!selectedCount}>
                        <Plus className="h-3.5 w-3.5" />
                        Add {selectedCount || ''} selected
                      </Button>
                      <Button size="sm" variant="outline" onClick={generateSkills} type="button">
                        <RefreshCw className="h-3.5 w-3.5" />
                        More
                      </Button>
                    </>
                  }
                >
                  <div className="flex flex-wrap gap-1.5">
                    {result.skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11.5px] transition',
                          added.has(skill)
                            ? 'border-forest bg-forest text-cream'
                            : 'border-forest/15 bg-paper/70 text-forest hover:border-forest/40'
                        )}
                      >
                        {added.has(skill) ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {skill}
                      </button>
                    ))}
                  </div>
                </DraftShell>
              ) : null}
            </div>
          )}

          {tab === 'polish' && (
            <div className="animate-fade">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[14px] font-semibold text-ink">Make a line stronger</h3>
                  <p className="mt-1 text-[11.5px] text-faint">Tighter wording, stronger verbs, same facts.</p>
                </div>
                <Badge tone="neutral" className="shrink-0 text-[9.5px]">{polishTargetLabel}</Badge>
              </div>
              <Field className="mt-4" label="Original text">
                <Textarea
                  rows={5}
                  value={polishText}
                  onChange={(event) => setPolishText(event.target.value.slice(0, 600))}
                  placeholder="Responsible for various frontend tasks…"
                />
              </Field>
              <Button className="mt-3 w-full" onClick={improve} loading={busy} type="button">
                <Wand2 className="h-4 w-4" />
                Improve this line
              </Button>

              {busy ? <LoadingDraft label="Polishing the wording…" /> : null}
              {result?.text && !busy ? (
                <DraftShell
                  provider={result.provider}
                  footer={
                    <>
                      {context?.target ? (
                        <Button size="sm" onClick={insertPoly} type="button">
                          <Check className="h-3.5 w-3.5" />
                          Use this version
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={improve} type="button">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try again
                      </Button>
                      <Button size="sm" variant="ghost" onClick={copyResult} type="button">
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </>
                  }
                >
                  <p className="text-[13px] leading-relaxed text-ink/85">{result.text}</p>
                </DraftShell>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-cream/50 px-3 py-2.5 text-[10.5px] leading-relaxed text-faint">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            AI drafts can be inaccurate. Verify every fact, metric, and claim before sending.
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
