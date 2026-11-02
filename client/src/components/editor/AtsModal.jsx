import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ScoreRing from '../ScoreRing';
import { Field, Textarea } from '../ui/Field';
import { useToast } from '../../context/ToastContext';
import { api, apiError } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function AtsModal({ open, onClose, resume, onAddSkills }) {
  const toast = useToast();
  const [jd, setJd] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [addedSkills, setAddedSkills] = useState(() => new Set());

  useEffect(() => {
    if (open) {
      setError('');
      setAddedSkills(new Set());
    }
  }, [open]);

  const analyze = async () => {
    if (!resume) return;
    if (jd.trim().length < 40) {
      setError('Paste a job description (at least a few lines) to analyze.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/ai/ats', {
        resume,
        jobDescription: jd,
        resumeId: resume.id,
      });
      setResult(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const addSkills = (skills) => {
    if (!skills.length) return;
    onAddSkills?.(skills);
    setAddedSkills((current) => {
      const next = new Set(current);
      skills.forEach((skill) => next.add(skill));
      return next;
    });
    toast(`${skills.length} skill${skills.length === 1 ? '' : 's'} added to your resume.`);
  };

  const addAllMissing = () => {
    const skills = (result?.missing || []).filter((skill) => !addedSkills.has(skill)).slice(0, 6);
    addSkills(skills);
  };

  const availableMissing = (result?.missing || []).filter((skill) => !addedSkills.has(skill));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="ATS match check"
      description="Compare this resume against a job post. Heuristic scoring, with fixes you can apply."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10.5px] text-faint">Heuristic scan — use it as a checklist, not a guarantee.</p>
          <div className="ml-auto flex flex-wrap gap-2">
            {result && availableMissing.length > 0 ? (
              <Button variant="outline" size="md" onClick={addAllMissing} type="button">
                <Plus className="h-4 w-4" />
                Add {Math.min(availableMissing.length, 6)} missing skills
              </Button>
            ) : null}
            <Button variant="ghost" onClick={onClose} type="button">
              Done
            </Button>
            <Button onClick={analyze} loading={busy} type="button">
              {result ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Re-analyze
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Analyze match
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Field
          label="Job description"
          hint="Paste the full post — the more context, the better the keyword match."
        >
          <Textarea
            rows={6}
            value={jd}
            onChange={(event) => setJd(event.target.value)}
            placeholder="Paste the job description here, including responsibilities, requirements, and nice-to-haves…"
          />
        </Field>

        {busy ? (
          <div className="grid gap-4 rounded-2xl border border-line bg-cream/30 p-5 sm:grid-cols-[130px_1fr]">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-forest" />
            </div>
            <div className="space-y-2.5 py-2">
              <div className="h-3 w-1/2 animate-pulse rounded bg-line/70" />
              <div className="h-2.5 w-full animate-pulse rounded bg-line/60" />
              <div className="h-2.5 w-5/6 animate-pulse rounded bg-line/50" />
              <p className="pt-1 text-[10.5px] text-faint">
                Scanning keywords, structure, and impact markers…
              </p>
            </div>
          </div>
        ) : null}

        {result && !busy ? (
          <div className="space-y-4 animate-fade">
            <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-cream/25 p-5">
              <ScoreRing value={result.score} size={118} stroke={8} label="match" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[18px] font-semibold tracking-tight text-ink">{result.grade}</h3>
                  <Badge tone={result.score >= 80 ? 'forest' : result.score >= 60 ? 'lime' : 'clay'}>
                    {result.score}/100
                  </Badge>
                </div>
                <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-soft">
                  You cover {result.matched.length} of {result.keywordsTotal} identified keywords. The resume
                  is {result.wordCount} words.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{result.matched.length} matched</Badge>
                  <Badge tone={result.missing.length ? 'clay' : 'forest'}>
                    {result.missing.length} missing
                  </Badge>
                  <Badge tone="neutral">
                    {result.checks.filter((check) => check.ok).length}/{result.checks.length} structure checks
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-moss">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Matched keywords
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.matched.length ? (
                    result.matched.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md border border-moss/15 bg-moss/[0.06] px-2 py-0.5 text-[10.5px] text-forest"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-[11.5px] text-faint">No keywords matched yet.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">
                  <Sparkles className="h-3.5 w-3.5" /> Missing keywords
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {availableMissing.length ? (
                    availableMissing.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => addSkills([keyword])}
                        className="inline-flex items-center gap-1 rounded-md border border-clay/20 bg-orange-50 px-2 py-0.5 text-[10.5px] text-clay transition hover:border-clay/40"
                        title="Add this skill"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        {keyword}
                      </button>
                    ))
                  ) : (
                    <p className="text-[11.5px] text-faint">
                      {result.missing.length ? 'All missing keywords added.' : 'No gaps found.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70">
                Structure checks
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {result.checks.map((check) => (
                  <div key={check.id} className="flex items-start gap-2">
                    {check.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-clay/60" />
                    )}
                    <div>
                      <p className={cn('text-[12px] font-medium', check.ok ? 'text-ink/80' : 'text-ink')}>
                        {check.label}
                      </p>
                      {!check.ok ? <p className="text-[10.5px] text-faint">{check.hint}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.suggestions.length ? (
              <div className="rounded-2xl border border-forest/10 bg-lime-soft/30 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest/70">
                  <Sparkles className="h-3.5 w-3.5" /> Suggested next steps
                </div>
                <ol className="mt-2 space-y-1.5">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2 text-[12px] leading-relaxed text-forest/85">
                      <span className="mt-[1px] font-display text-[13px] text-forest/50">{index + 1}.</span>
                      {suggestion}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}

        {!result && !busy ? (
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-line bg-cream/30 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream-deep text-forest">
              <Check className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-[12.5px] font-medium text-ink">What we look for</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
                Keyword coverage, contact details, a real summary, quantified bullets, a skills
                section, education, and dates on every role.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
