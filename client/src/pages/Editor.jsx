import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Briefcase,
  Check,
  Download,
  Eye,
  FileX,
  FolderGit2,
  GraduationCap,
  Languages,
  LineChart,
  Loader2,
  Maximize2,
  Palette,
  PenLine,
  Share2,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { Logo } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ResumeFrame from '../components/ResumeFrame';
import ResumeDocument from '../components/ResumeDocument';
import {
  CertificationsSection,
  DesignSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  PersonalSection,
  ProjectsSection,
  SkillsSection,
  SummarySection,
} from '../components/editor/EditorSections';
import AIDrawer from '../components/editor/AIDrawer';
import AtsModal from '../components/editor/AtsModal';
import ShareModal from '../components/editor/ShareModal';
import { useToast } from '../context/ToastContext';
import { api, apiError } from '../lib/api';
import { downloadResumePdf } from '../lib/pdf';
import {
  cn,
  filenameFromResume,
  newCertification,
  newEducation,
  newExperience,
  newLanguage,
  newProject,
  resumeStrength,
} from '../lib/utils';

const SECTIONS = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'summary', label: 'Summary', icon: PenLine },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'projects', label: 'Projects', icon: FolderGit2 },
  { key: 'skills', label: 'Skills', icon: Zap },
  { key: 'certifications', label: 'Certifications', icon: Award },
  { key: 'languages', label: 'Languages', icon: Languages },
  { key: 'design', label: 'Design', icon: Palette },
];

const CREATORS = {
  experience: newExperience,
  education: newEducation,
  projects: newProject,
  certifications: newCertification,
  languages: newLanguage,
};

function payloadOf(resume) {
  if (!resume) return {};
  return {
    title: resume.title,
    template: resume.template,
    accent: resume.accent,
    personal: resume.personal,
    experience: resume.experience,
    education: resume.education,
    projects: resume.projects,
    skills: resume.skills,
    certifications: resume.certifications,
    languages: resume.languages,
  };
}

function EditorLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex h-16 max-w-[1700px] items-center gap-3 border-b border-line/70 px-4">
        <div className="h-9 w-9 animate-pulse rounded-xl bg-cream-deep" />
        <div className="h-4 w-44 animate-pulse rounded bg-cream-deep" />
      </div>
      <div className="mx-auto grid max-w-[1700px] gap-6 px-4 pt-5 xl:grid-cols-[212px_minmax(0,1fr)_480px]">
        <div className="hidden h-[430px] animate-pulse rounded-3xl border border-line bg-paper/60 xl:block" />
        <div className="h-[560px] animate-pulse rounded-3xl border border-line bg-paper/60" />
        <div className="hidden h-[640px] animate-pulse rounded-3xl border border-line bg-paper/60 xl:block" />
      </div>
    </div>
  );
}

function StrengthCard({ strength, onAts }) {
  const done = strength.missing.length === 0;
  return (
    <div className="rounded-3xl border border-line bg-paper p-4 shadow-card">
      <div className="flex items-end justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
          Resume strength
        </span>
        <span className="font-display text-[24px] leading-none text-ink">{strength.percent}%</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-cream-deep">
        <div
          className="h-full rounded-full bg-forest transition-all duration-500"
          style={{ width: `${strength.percent || 2}%` }}
        />
      </div>
      {done ? (
        <p className="mt-3 text-[11px] leading-relaxed text-moss">
          Every check passed. Ready to send.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {strength.missing.slice(0, 4).map((hint) => (
            <li key={hint} className="flex items-start gap-2 text-[11px] leading-snug text-faint">
              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-clay" />
              {hint}
            </li>
          ))}
        </ul>
      )}
      <Button variant="outline" size="sm" className="mt-3.5 w-full" onClick={onAts} type="button">
        <Target className="h-3.5 w-3.5" />
        Run ATS check
      </Button>
    </div>
  );
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [section, setSection] = useState('personal');
  const [saveState, setSaveState] = useState('saved');
  const [saveError, setSaveError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTab, setAiTab] = useState('summary');
  const [aiContext, setAiContext] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);

  const resumeRef = useRef(null);
  const savedRef = useRef(null);
  const inflightRef = useRef(null);
  const debounceRef = useRef(null);
  const exportRef = useRef(null);
  const saveStateRef = useRef('saved');

  const strength = useMemo(() => resumeStrength(resume), [resume]);

  const updateResume = useCallback((updater) => {
    const current = resumeRef.current;
    if (!current) return;
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    if (!next || next === current) return;
    resumeRef.current = next;
    setResume(next);
  }, []);

  const markSaving = useCallback((next) => {
    saveStateRef.current = next;
    setSaveState(next);
  }, []);

  const saveNow = useCallback(async () => {
    if (inflightRef.current) {
      await inflightRef.current.catch(() => {});
    }
    const current = resumeRef.current;
    if (!current) return true;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const payload = payloadOf(current);
    const serialized = JSON.stringify(payload);
    if (serialized === savedRef.current) {
      markSaving('saved');
      return true;
    }

    markSaving('saving');
    setSaveError('');

    const task = api
      .put(`/resumes/${current.id}`, payload)
      .then(({ data }) => {
        savedRef.current = serialized;
        setLastSavedAt(data?.resume?.lastEditedAt || new Date().toISOString());
        markSaving('saved');
        return true;
      })
      .catch((err) => {
        markSaving('error');
        setSaveError(apiError(err));
        return false;
      })
      .finally(() => {
        inflightRef.current = null;
      });

    inflightRef.current = task;
    const ok = await task;
    if (!ok) return false;

    if (JSON.stringify(payloadOf(resumeRef.current)) !== savedRef.current) {
      return saveNow();
    }
    return true;
  }, [markSaving]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setResume(null);
    resumeRef.current = null;
    savedRef.current = null;
    setError('');

    api
      .get(`/resumes/${id}`)
      .then(({ data }) => {
        if (!active) return;
        const loaded = data.resume;
        savedRef.current = JSON.stringify(payloadOf(loaded));
        resumeRef.current = loaded;
        setResume(loaded);
        setLastSavedAt(loaded.lastEditedAt || loaded.updatedAt || null);
        markSaving('saved');
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
  }, [id, markSaving]);

  useEffect(() => {
    if (!resume) return undefined;
    const serialized = JSON.stringify(payloadOf(resume));
    if (serialized === savedRef.current) return undefined;

    markSaving('dirty');
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
      saveNow();
    }, 900);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [resume, saveNow, markSaving]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveNow().then((ok) => {
          if (ok) toast('Resume saved.');
          else toast('Could not save. Check the connection and retry.', 'error');
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saveNow, toast]);

  useEffect(() => {
    const guard = (event) => {
      if (saveStateRef.current === 'saved') return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, []);

  useEffect(() => {
    api
      .get('/ai/status')
      .then(({ data }) => setAiStatus(data.ai))
      .catch(() => {});
    api
      .get('/uploads/status')
      .then(({ data }) => setStorageStatus(data.storage))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = resume?.title ? `${resume.title} — Vitae` : 'Editor — Vitae';
  }, [resume?.title]);

  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    },
    []
  );

  const leave = async () => {
    const ok = await saveNow();
    if (!ok) {
      toast('Your latest changes could not be saved. Retry before leaving.', 'error');
      return;
    }
    navigate('/dashboard');
  };

  const uploadPhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/uploads/avatar', form);
      updateResume((current) => ({
        ...current,
        personal: { ...current.personal, photoUrl: data.url },
      }));
      toast(data.provider === 'imagekit' ? 'Photo uploaded to ImageKit.' : 'Photo uploaded.');
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    updateResume((current) => ({
      ...current,
      personal: { ...current.personal, photoUrl: '' },
    }));
  };

  const openAI = (tab, context = null) => {
    setAiTab(tab);
    setAiContext(context);
    setAiOpen(true);
  };

  const useSummary = (text) => {
    updateResume((current) => ({
      ...current,
      personal: { ...current.personal, summary: String(text || '').slice(0, 700) },
    }));
    toast('Summary applied. Tweak it to match your voice.');
    setSection('summary');
  };

  const insertBullets = (experienceIndex, bullets) => {
    const current = resumeRef.current;
    const entry = current?.experience?.[experienceIndex];
    if (!entry) return;
    const existing = new Set(
      (entry.bullets || []).map((bullet) => String(bullet).trim().toLowerCase()).filter(Boolean)
    );
    const fresh = (bullets || [])
      .map((bullet) => String(bullet).trim())
      .filter((bullet) => bullet && !existing.has(bullet.toLowerCase()));
    if (!fresh.length) {
      toast('Those bullets are already on this role.', 'info');
      return;
    }
    const merged = [...(entry.bullets || []).filter((bullet) => String(bullet).trim()), ...fresh];
    updateResume((currentResume) => ({
      ...currentResume,
      experience: currentResume.experience.map((item, index) =>
        index === experienceIndex ? { ...item, bullets: merged } : item
      ),
    }));
    toast(`${fresh.length} bullet${fresh.length === 1 ? '' : 's'} added.`);
  };

  const addSkills = useCallback((incoming) => {
    const current = resumeRef.current;
    if (!current) return;
    const seen = new Set((current.skills || []).map((skill) => String(skill).toLowerCase()));
    const fresh = [];
    for (const raw of incoming || []) {
      const skill = String(raw).trim().slice(0, 40);
      if (!skill || seen.has(skill.toLowerCase())) continue;
      seen.add(skill.toLowerCase());
      fresh.push(skill);
      if (fresh.length >= 12) break;
    }
    if (!fresh.length) return;
    updateResume((currentResume) => ({
      ...currentResume,
      skills: [...(currentResume.skills || []), ...fresh],
    }));
  }, [updateResume]);

  const replaceText = (text) => {
    if (!aiContext) return;
    if (aiContext.target === 'summary') {
      useSummary(text);
      return;
    }
    if (aiContext.target === 'bullet') {
      const { experienceIndex, bulletIndex } = aiContext;
      updateResume((current) => ({
        ...current,
        experience: current.experience.map((item, index) =>
          index === experienceIndex
            ? {
                ...item,
                bullets: (item.bullets || []).map((bullet, bulletIdx) =>
                  bulletIdx === bulletIndex ? String(text) : bullet
                ),
              }
            : item
        ),
      }));
      toast('Bullet updated.');
    }
  };

  const shareUpdated = (updated) => {
    if (!updated) return;
    updateResume((current) => ({
      ...current,
      slug: updated.slug,
      visibility: updated.visibility,
      views: updated.views,
    }));
  };

  const exportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await saveNow();
      if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
      await downloadResumePdf(exportRef.current, filenameFromResume(resumeRef.current));
      toast('PDF downloaded.');
    } catch (err) {
      toast(err?.message || 'Could not export the PDF. Try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const listHandlers = (key) => ({
    onChangeItem: (index, patch) =>
      updateResume((current) => ({
        ...current,
        [key]: current[key].map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...patch } : item
        ),
      })),
    onAddItem: () =>
      updateResume((current) => ({
        ...current,
        [key]: [...(current[key] || []), CREATORS[key]()],
      })),
    onRemoveItem: (index) =>
      updateResume((current) => ({
        ...current,
        [key]: current[key].filter((_, itemIndex) => itemIndex !== index),
      })),
    onMoveItem: (index, direction) =>
      updateResume((current) => {
        const list = [...(current[key] || [])];
        const target = index + direction;
        if (target < 0 || target >= list.length) return current;
        [list[index], list[target]] = [list[target], list[index]];
        return { ...current, [key]: list };
      }),
  });

  const renderSection = () => {
    if (!resume) return null;
    switch (section) {
      case 'personal':
        return (
          <PersonalSection
            personal={resume.personal}
            onChange={(field, value) =>
              updateResume((current) => ({
                ...current,
                personal: { ...current.personal, [field]: value },
              }))
            }
            onUploadPhoto={uploadPhoto}
            onRemovePhoto={removePhoto}
            uploading={uploadingPhoto}
            storageStatus={storageStatus}
          />
        );
      case 'summary':
        return (
          <SummarySection
            summary={resume.personal.summary}
            onChange={(value) =>
              updateResume((current) => ({
                ...current,
                personal: { ...current.personal, summary: value },
              }))
            }
            onGenerate={() => openAI('summary')}
            onImprove={() =>
              openAI('polish', { target: 'summary', text: resume.personal.summary })
            }
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            items={resume.experience}
            {...listHandlers('experience')}
            onOpenAI={(index) => openAI('bullets', { experienceIndex: index })}
            onPolish={(experienceIndex, bulletIndex, text) =>
              openAI('polish', {
                target: 'bullet',
                text,
                experienceIndex,
                bulletIndex,
              })
            }
          />
        );
      case 'education':
        return <EducationSection items={resume.education} {...listHandlers('education')} />;
      case 'projects':
        return <ProjectsSection items={resume.projects} {...listHandlers('projects')} />;
      case 'skills':
        return (
          <SkillsSection
            skills={resume.skills}
            onChange={(skills) => updateResume((current) => ({ ...current, skills }))}
            onOpenAI={() => openAI('skills')}
          />
        );
      case 'certifications':
        return (
          <CertificationsSection items={resume.certifications} {...listHandlers('certifications')} />
        );
      case 'languages':
        return <LanguagesSection items={resume.languages} {...listHandlers('languages')} />;
      case 'design':
        return (
          <DesignSection
            resume={resume}
            onChange={(patch) => updateResume((current) => ({ ...current, ...patch }))}
            onOpenShare={() => setShareOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <EditorLoading />;

  if (!resume) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-4">
        <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 text-center shadow-card">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <FileX className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-[30px] leading-none text-ink">Resume not available</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-soft">
            {error || 'This resume may have been deleted or belongs to another account.'}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')} type="button">
              Back to dashboard
            </Button>
            <Button onClick={() => window.location.reload()} type="button">
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const counts = {
    experience: resume.experience.length,
    education: resume.education.length,
    projects: resume.projects.length,
    skills: resume.skills.length,
    certifications: resume.certifications.length,
    languages: resume.languages.length,
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur-md no-print">
        <div className="mx-auto flex h-16 max-w-[1700px] items-center gap-1 px-2 sm:gap-2 sm:px-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={leave}
            aria-label="Back to dashboard"
            title="Back to dashboard (saves first)"
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Link to="/dashboard" className="hidden shrink-0 sm:block" aria-label="Vitae dashboard">
            <Logo size="sm" />
          </Link>

          <div className="mx-1 flex min-w-0 flex-1 flex-col sm:mx-2">
            <input
              value={resume.title}
              onChange={(event) =>
                updateResume((current) => ({ ...current, title: event.target.value.slice(0, 120) }))
              }
              aria-label="Resume name"
              className="w-full truncate rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-[13.5px] font-semibold tracking-tight text-ink outline-none transition hover:border-line focus:border-forest/25 focus:bg-paper sm:text-[14.5px]"
            />
            <div
              className="flex items-center gap-1 px-1.5 text-[10.5px] text-faint"
              title={
                lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : undefined
              }
            >
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-forest" />
                  Saving…
                </>
              ) : saveState === 'dirty' ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                  Unsaved changes
                </>
              ) : saveState === 'error' ? (
                <button
                  type="button"
                  onClick={saveNow}
                  className="flex items-center gap-1 text-red-600 hover:underline"
                  title={saveError}
                >
                  <AlertCircle className="h-3 w-3" />
                  Save failed — retry
                </button>
              ) : (
                <>
                  <Check className="h-3 w-3 text-moss" />
                  All changes saved
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setPreviewOpen(true)}
              aria-label="Preview resume"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAtsOpen(true)}
              aria-label="ATS match check"
              title="ATS check"
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareOpen(true)}
              aria-label="Share resume"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="lime" size="sm" onClick={() => openAI('summary')}>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI assistant</span>
              <span className="sm:hidden">AI</span>
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={exportPdf}
              loading={exporting}
              className="hidden sm:inline-flex"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Download</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1700px] px-3 pb-24 pt-4 sm:px-5 sm:pt-5">
        <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1 xl:hidden">
          {SECTIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSection(item.key)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition',
                section === item.key
                  ? 'border-forest bg-forest text-cream'
                  : 'border-line bg-paper text-soft hover:border-ink/20'
              )}
            >
              <item.icon
                className={cn('h-3.5 w-3.5', section === item.key ? 'text-lime' : 'text-faint')}
              />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 shadow-card xl:hidden">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-ink">Resume strength</span>
              <span className="tabular-nums text-soft">{strength.percent}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-deep">
              <div
                className="h-full rounded-full bg-forest transition-all duration-500"
                style={{ width: `${strength.percent || 2}%` }}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAtsOpen(true)} type="button">
            <Target className="h-3.5 w-3.5" />
            ATS
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[212px_minmax(0,1fr)_480px]">
          <aside className="hidden xl:block">
            <div className="sticky top-[84px] space-y-3">
              <nav className="rounded-3xl border border-line bg-paper p-2 shadow-card">
                {SECTIONS.map((item) => {
                  const active = section === item.key;
                  const count = counts[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSection(item.key)}
                      aria-current={active ? 'step' : undefined}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium transition',
                        active ? 'bg-forest text-cream' : 'text-soft hover:bg-cream hover:text-ink'
                      )}
                    >
                      <item.icon
                        className={cn('h-4 w-4 shrink-0', active ? 'text-lime' : 'text-faint')}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      {count ? (
                        <span
                          className={cn(
                            'rounded-full px-1.5 text-[10px] tabular-nums',
                            active ? 'bg-cream/15 text-cream/80' : 'bg-cream-deep text-faint'
                          )}
                        >
                          {count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
              <StrengthCard strength={strength} onAts={() => setAtsOpen(true)} />
            </div>
          </aside>

          <div className="min-w-0">
            <div key={section} className="animate-fade">
              {renderSection()}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper/70 px-4 py-3">
              <p className="text-[11px] text-faint">
                Autosaved as you type · press ⌘S / Ctrl+S to save now
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={leave} type="button">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
                <Button variant="dark" size="sm" onClick={exportPdf} loading={exporting} type="button">
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-[84px] space-y-3">
              <div className="overflow-hidden rounded-3xl border border-line bg-paper shadow-card">
                <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                    <Eye className="h-3.5 w-3.5" />
                    Live preview
                  </span>
                  <div className="flex items-center gap-1">
                    <select
                      value={resume.template}
                      onChange={(event) =>
                        updateResume((current) => ({ ...current, template: event.target.value }))
                      }
                      aria-label="Template"
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-[11px] font-medium text-ink/80 outline-none transition focus:border-forest/30"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                      <option value="compact">Compact</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-cream hover:text-ink"
                      aria-label="Expand preview"
                      title="Expand preview"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="max-h-[calc(100vh-220px)] overflow-y-auto bg-cream-deep/30 p-3">
                  <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
                    <ResumeFrame resume={resume} placeholder={false} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-line px-3.5 py-2 text-[10.5px] text-faint">
                  <span>A4 · 794 × 1123 px</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShareOpen(true)}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition hover:bg-cream hover:text-ink"
                    >
                      <Share2 className="h-3 w-3" />
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={exportPdf}
                      disabled={exporting}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition hover:bg-cream hover:text-ink disabled:opacity-50"
                    >
                      {exporting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-2xl border border-forest/10 bg-lime-soft/40 px-3.5 py-3 text-[11px] leading-relaxed text-forest/80">
                <LineChart className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Preview updates live. AI drafts, ATS checks and sharing all run against the
                version you are editing.
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0 no-print">
        <div ref={exportRef} style={{ width: 794, backgroundColor: '#ffffff' }}>
          <ResumeDocument resume={resume} placeholder={false} template={resume.template} />
        </div>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        size="xl"
        title="Resume preview"
        description="This is exactly what downloads as a PDF."
        bodyClassName="bg-cream-deep/30"
      >
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
          <ResumeFrame resume={resume} placeholder={false} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="dark" onClick={exportPdf} loading={exporting} type="button">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setPreviewOpen(false);
              setShareOpen(true);
            }}
            type="button"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          {resume.visibility === 'public' && resume.slug ? (
            <Button variant="ghost" as="a" href={`/r/${resume.slug}`} target="_blank" rel="noreferrer">
              Open public page
            </Button>
          ) : null}
        </div>
      </Modal>

      <AIDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        initialTab={aiTab}
        context={aiContext}
        resume={resume}
        aiStatus={aiStatus}
        onUseSummary={useSummary}
        onInsertBullets={insertBullets}
        onAddSkills={addSkills}
        onReplaceText={replaceText}
      />

      <AtsModal
        open={atsOpen}
        onClose={() => setAtsOpen(false)}
        resume={resume}
        onAddSkills={addSkills}
      />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        resume={resume}
        onUpdated={shareUpdated}
        onBeforeChange={saveNow}
      />
    </div>
  );
}
