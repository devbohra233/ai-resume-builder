import { useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  Briefcase,
  Camera,
  ChevronDown,
  Copy,
  FolderGit2,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  Palette,
  PenLine,
  Plus,
  Sparkles,
  Target,
  Trash2,
  User,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Field, Input, Select, Textarea } from '../ui/Field';
import ResumeFrame from '../ResumeFrame';
import { cn, initials, isLightColor } from '../../lib/utils';

const FIELD_TEXTAREA =
  'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-faint/80 outline-none transition-all duration-150 focus:border-forest/35 focus:ring-4 focus:ring-forest/[0.07]';

export function SectionShell({ icon: Icon, title, description, action, children }) {
  return (
    <section className="rounded-3xl border border-line bg-paper shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream-deep text-forest">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-display text-[24px] leading-none text-ink">{title}</h2>
            <p className="mt-1.5 max-w-xl text-[11.5px] leading-relaxed text-faint">{description}</p>
          </div>
        </div>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function AutoTextarea({ value, onChange, rows = 2, className, placeholder, ariaLabel }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 38)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={onChange}
      className={cn(FIELD_TEXTAREA, 'resize-none overflow-hidden leading-relaxed', className)}
    />
  );
}

function EmptyHint({ icon: Icon, title, body, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-cream/30 px-5 py-8 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-cream-deep text-forest">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="mt-3 text-[13.5px] font-medium text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-faint">{body}</p>
      {onAction ? (
        <Button variant="soft" size="sm" className="mt-4" onClick={onAction}>
          <Plus className="h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function EntryCard({
  title,
  subtitle,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-cream/25">
      <div className="flex items-center gap-1 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-faint transition-transform', !open && '-rotate-90')}
          />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-ink">{title || 'Untitled'}</span>
            {subtitle ? <span className="block truncate text-[11px] text-faint">{subtitle}</span> : null}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded-md p-1.5 text-faint transition hover:bg-paper hover:text-ink disabled:opacity-30"
            aria-label="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded-md p-1.5 text-faint transition hover:bg-paper hover:text-ink disabled:opacity-30"
            aria-label="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1.5 text-faint transition hover:bg-red-50 hover:text-red-600"
            aria-label="Remove entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {open ? <div className="border-t border-line px-3.5 py-4">{children}</div> : null}
    </div>
  );
}

function BulletEditor({ bullets = [], onChange, onPolish, placeholder = 'Led … resulting in …' }) {
  const list = bullets.length ? bullets : [''];
  const update = (index, value) => onChange(list.map((item, i) => (i === index ? value : item)));
  const remove = (index) => onChange(list.filter((_, i) => i !== index));
  const add = () => onChange([...list, '']);

  return (
    <div className="space-y-1.5">
      {list.map((bullet, index) => (
        <div key={index} className="flex items-start gap-1.5">
          <span className="mt-[19px] h-1 w-1 shrink-0 rounded-full bg-faint" />
          <AutoTextarea
            value={bullet}
            onChange={(event) => update(index, event.target.value)}
            placeholder={placeholder}
            ariaLabel={`Bullet ${index + 1}`}
            className="flex-1 py-2 text-[13px]"
          />
          <div className="mt-1 flex flex-col gap-0.5">
            {onPolish ? (
              <button
                type="button"
                onClick={() => onPolish(index, bullet)}
                className="rounded-md p-1 text-faint transition hover:bg-lime-soft hover:text-forest"
                title="Polish with AI"
                aria-label="Polish bullet with AI"
                disabled={!bullet.trim()}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-md p-1 text-faint transition hover:bg-red-50 hover:text-red-600"
              title="Remove bullet"
              aria-label="Remove bullet"
              disabled={list.length === 1 && !bullet}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      <Button variant="ghost" size="xs" type="button" onClick={add} className="ml-2 text-forest">
        <Plus className="h-3 w-3" />
        Add bullet
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PersonalSection({
  personal,
  onChange,
  onUploadPhoto,
  onRemovePhoto,
  uploading,
  storageStatus,
}) {
  const fileRef = useRef(null);
  return (
    <SectionShell
      icon={User}
      title="Personal details"
      description="The header of your resume. Keep it scannable — recruiters spend seconds here."
    >
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-cream/30 p-4">
        <div className="relative">
          <div className="grid h-[76px] w-[76px] place-items-center overflow-hidden rounded-full border border-line bg-forest font-display text-[24px] text-lime">
            {personal.photoUrl ? (
              <img src={personal.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(personal.fullName)
            )}
          </div>
          {personal.photoUrl ? (
            <button
              type="button"
              onClick={onRemovePhoto}
              className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-line bg-paper text-faint shadow-sm transition hover:text-red-600"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-medium text-ink">Resume photo</p>
            {storageStatus ? (
              <Badge
                tone={storageStatus.enabled ? 'forest' : 'neutral'}
                icon={ImageIcon}
                className="text-[10px]"
              >
                {storageStatus.enabled ? 'ImageKit' : 'Local storage'}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-faint">
            {storageStatus?.enabled
              ? 'Uploads are optimized and delivered from the ImageKit CDN.'
              : 'Photos are saved on the app server. Add ImageKit keys to enable CDN delivery.'}{' '}
            Optional — the photo appears in the Modern template.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fileRef.current?.click()}
              loading={uploading}
            >
              <Camera className="h-3.5 w-3.5" />
              {personal.photoUrl ? 'Replace photo' : 'Upload photo'}
            </Button>
            {personal.photoUrl ? (
              <Button variant="ghost" size="sm" type="button" onClick={onRemovePhoto}>
                Remove
              </Button>
            ) : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUploadPhoto(file);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <Input
            value={personal.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            placeholder="Jordan Ellis"
            autoComplete="name"
          />
        </Field>
        <Field label="Target role">
          <Input
            value={personal.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="Senior Product Engineer"
          />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            value={personal.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={personal.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
          />
        </Field>
        <Field label="Location">
          <Input
            value={personal.location}
            onChange={(event) => onChange('location', event.target.value)}
            placeholder="San Francisco, CA"
          />
        </Field>
        <Field label="Website / portfolio">
          <Input
            value={personal.website}
            onChange={(event) => onChange('website', event.target.value)}
            placeholder="yoursite.dev"
          />
        </Field>
        <Field label="LinkedIn">
          <Input
            value={personal.linkedin}
            onChange={(event) => onChange('linkedin', event.target.value)}
            placeholder="linkedin.com/in/you"
          />
        </Field>
        <Field label="GitHub">
          <Input
            value={personal.github}
            onChange={(event) => onChange('github', event.target.value)}
            placeholder="github.com/you"
          />
        </Field>
      </div>
    </SectionShell>
  );
}

export function SummarySection({ summary, onChange, onGenerate, onImprove }) {
  return (
    <SectionShell
      icon={PenLine}
      title="Professional summary"
      description="Two or three sentences that connect your experience to the role you want."
      action={
        <Button variant="soft" size="sm" type="button" onClick={onGenerate}>
          <Sparkles className="h-3.5 w-3.5" />
          Generate
        </Button>
      }
    >
      <Field
        aside={
          <span className="text-[10.5px] tabular-nums text-faint">{summary.length} / 700</span>
        }
      >
        <Textarea
          value={summary}
          onChange={(event) => onChange(event.target.value.slice(0, 700))}
          rows={6}
          placeholder="Senior product engineer with 8+ years of experience building …"
        />
      </Field>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-faint">
          Lead with scope and stack, then land one measurable win. No first-person pronouns.
        </p>
        <Button variant="outline" size="sm" type="button" onClick={onImprove} disabled={summary.length < 20}>
          <Wand2 className="h-3.5 w-3.5" />
          Improve with AI
        </Button>
      </div>
    </SectionShell>
  );
}

export function ExperienceSection({
  items,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onOpenAI,
  onPolish,
}) {
  return (
    <SectionShell
      icon={Briefcase}
      title="Experience"
      description="Most recent first. Each role should earn its space with outcomes, not duties."
      action={
        <Button variant="soft" size="sm" type="button" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5" />
          Add role
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyHint
          icon={Briefcase}
          title="No roles yet"
          body="Add your latest position and let Vitae help you turn responsibilities into evidence."
          actionLabel="Add your first role"
          onAction={onAddItem}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <EntryCard
              key={item.id}
              title={item.role || 'New role'}
              subtitle={[item.company, item.startDate && `${item.startDate}${item.current ? ' — present' : item.endDate ? ` — ${item.endDate}` : ''}`]
                .filter(Boolean)
                .join(' · ')}
              onMoveUp={() => onMoveItem(index, -1)}
              onMoveDown={() => onMoveItem(index, 1)}
              onRemove={() => onRemoveItem(index)}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role">
                  <Input
                    value={item.role}
                    onChange={(event) => onChangeItem(index, { role: event.target.value })}
                    placeholder="Senior Frontend Engineer"
                  />
                </Field>
                <Field label="Company">
                  <Input
                    value={item.company}
                    onChange={(event) => onChangeItem(index, { company: event.target.value })}
                    placeholder="Northwind Labs"
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={item.location}
                    onChange={(event) => onChangeItem(index, { location: event.target.value })}
                    placeholder="Remote · San Francisco, CA"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start">
                    <Input
                      type="month"
                      value={item.startDate}
                      onChange={(event) => onChangeItem(index, { startDate: event.target.value })}
                    />
                  </Field>
                  <Field label="End">
                    <Input
                      type="month"
                      value={item.endDate}
                      onChange={(event) => onChangeItem(index, { endDate: event.target.value })}
                      disabled={item.current}
                    />
                  </Field>
                </div>
              </div>

              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[12px] text-soft">
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(event) => onChangeItem(index, { current: event.target.checked })}
                  className="h-4 w-4 rounded border-line accent-[#143c2f]"
                />
                I currently work here
              </label>

              <div className="mt-4 rounded-xl border border-line bg-paper p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-ink/85">Impact bullets</span>
                  <Button
                    variant="soft"
                    size="xs"
                    type="button"
                    onClick={() => onOpenAI(index)}
                  >
                    <Sparkles className="h-3 w-3" />
                    Write with AI
                  </Button>
                </div>
                <BulletEditor
                  bullets={item.bullets}
                  onChange={(bullets) => onChangeItem(index, { bullets })}
                  onPolish={(bulletIndex, text) => onPolish(index, bulletIndex, text)}
                  placeholder="Led a team of 6 to rebuild checkout in React, lifting conversion 18%."
                />
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

export function EducationSection({ items, onChangeItem, onAddItem, onRemoveItem, onMoveItem }) {
  return (
    <SectionShell
      icon={GraduationCap}
      title="Education"
      description="Highest qualification first. Keep it brief once you have work experience."
      action={
        <Button variant="soft" size="sm" type="button" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5" />
          Add education
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyHint
          icon={GraduationCap}
          title="No education added"
          body="Add a degree, bootcamp, or relevant coursework. Recruiters look for the essentials."
          actionLabel="Add education"
          onAction={onAddItem}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <EntryCard
              key={item.id}
              title={item.degree || 'Degree'}
              subtitle={item.school}
              onMoveUp={() => onMoveItem(index, -1)}
              onMoveDown={() => onMoveItem(index, 1)}
              onRemove={() => onRemoveItem(index)}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Degree">
                  <Input
                    value={item.degree}
                    onChange={(event) => onChangeItem(index, { degree: event.target.value })}
                    placeholder="B.S. in Computer Science"
                  />
                </Field>
                <Field label="School">
                  <Input
                    value={item.school}
                    onChange={(event) => onChangeItem(index, { school: event.target.value })}
                    placeholder="University of California, Berkeley"
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={item.location}
                    onChange={(event) => onChangeItem(index, { location: event.target.value })}
                    placeholder="Berkeley, CA"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start">
                    <Input
                      type="month"
                      value={item.startDate}
                      onChange={(event) => onChangeItem(index, { startDate: event.target.value })}
                    />
                  </Field>
                  <Field label="End">
                    <Input
                      type="month"
                      value={item.endDate}
                      onChange={(event) => onChangeItem(index, { endDate: event.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Grade / honors">
                  <Input
                    value={item.grade}
                    onChange={(event) => onChangeItem(index, { grade: event.target.value })}
                    placeholder="GPA 3.8 / 4.0"
                  />
                </Field>
                <Field label="Details">
                  <Input
                    value={item.details}
                    onChange={(event) => onChangeItem(index, { details: event.target.value })}
                    placeholder="Minor in Cognitive Science · Regents Scholar"
                  />
                </Field>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

export function ProjectsSection({ items, onChangeItem, onAddItem, onRemoveItem, onMoveItem }) {
  return (
    <SectionShell
      icon={FolderGit2}
      title="Projects"
      description="Optional. A focused side project can outweigh a long list of responsibilities."
      action={
        <Button variant="soft" size="sm" type="button" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5" />
          Add project
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyHint
          icon={FolderGit2}
          title="No projects yet"
          body="Add an open-source tool, a portfolio piece, or a product you are proud of."
          actionLabel="Add a project"
          onAction={onAddItem}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <EntryCard
              key={item.id}
              title={item.name || 'Project'}
              subtitle={item.tech}
              onMoveUp={() => onMoveItem(index, -1)}
              onMoveDown={() => onMoveItem(index, 1)}
              onRemove={() => onRemoveItem(index)}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Project name">
                  <Input
                    value={item.name}
                    onChange={(event) => onChangeItem(index, { name: event.target.value })}
                    placeholder="Pulse — open-source uptime monitor"
                  />
                </Field>
                <Field label="Link">
                  <Input
                    value={item.link}
                    onChange={(event) => onChangeItem(index, { link: event.target.value })}
                    placeholder="github.com/you/project"
                  />
                </Field>
                <Field label="Tech / stack" className="sm:col-span-2">
                  <Input
                    value={item.tech}
                    onChange={(event) => onChangeItem(index, { tech: event.target.value })}
                    placeholder="React · Node.js · Redis"
                  />
                </Field>
              </div>
              <div className="mt-3 rounded-xl border border-line bg-paper p-3">
                <span className="mb-2 block text-[12px] font-semibold text-ink/85">Highlights</span>
                <BulletEditor
                  bullets={item.bullets}
                  onChange={(bullets) => onChangeItem(index, { bullets })}
                  placeholder="Built X that achieved Y; adopted by Z users."
                />
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

export function SkillsSection({ skills, onChange, onOpenAI }) {
  const [draft, setDraft] = useState('');

  const addSkill = (value) => {
    const skill = value.trim().replace(/,+$/, '');
    if (!skill) return;
    if (!skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      onChange([...skills, skill.slice(0, 40)]);
    }
    setDraft('');
  };

  return (
    <SectionShell
      icon={Zap}
      title="Skills"
      description="8–14 focused skills beat a wall of keywords. Mirror the language of the job post."
      action={
        <Button variant="soft" size="sm" type="button" onClick={onOpenAI}>
          <Sparkles className="h-3.5 w-3.5" />
          Suggest skills
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-cream/50 py-1 pl-2.5 pr-1.5 text-[12.5px] text-ink/85"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((_, i) => i !== index))}
              className="rounded-md p-0.5 text-faint transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {skills.length === 0 ? (
          <p className="text-[12px] text-faint">No skills yet — add a few below.</p>
        ) : null}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addSkill(draft);
            }
          }}
          placeholder="Type a skill and press Enter"
          maxLength={40}
        />
        <Button variant="outline" type="button" onClick={() => addSkill(draft)} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-faint">{skills.length} skills · order them by relevance.</p>
    </SectionShell>
  );
}

export function CertificationsSection({ items, onChangeItem, onAddItem, onRemoveItem, onMoveItem }) {
  return (
    <SectionShell
      icon={Award}
      title="Certifications"
      description="Optional. Add credentials that back up the skills on your resume."
      action={
        <Button variant="soft" size="sm" type="button" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5" />
          Add certification
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyHint
          icon={Award}
          title="No certifications yet"
          body="Cloud, security, or domain certifications can be a strong signal. Skip if not relevant."
          actionLabel="Add certification"
          onAction={onAddItem}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <EntryCard
              key={item.id}
              title={item.name || 'Certification'}
              subtitle={item.issuer}
              onMoveUp={() => onMoveItem(index, -1)}
              onMoveDown={() => onMoveItem(index, 1)}
              onRemove={() => onRemoveItem(index)}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <Input
                    value={item.name}
                    onChange={(event) => onChangeItem(index, { name: event.target.value })}
                    placeholder="AWS Certified Developer – Associate"
                  />
                </Field>
                <Field label="Issuer">
                  <Input
                    value={item.issuer}
                    onChange={(event) => onChangeItem(index, { issuer: event.target.value })}
                    placeholder="Amazon Web Services"
                  />
                </Field>
                <Field label="Date / year">
                  <Input
                    value={item.date}
                    onChange={(event) => onChangeItem(index, { date: event.target.value })}
                    placeholder="2023"
                  />
                </Field>
                <Field label="Credential link">
                  <Input
                    value={item.link}
                    onChange={(event) => onChangeItem(index, { link: event.target.value })}
                    placeholder="credential URL"
                  />
                </Field>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

export function LanguagesSection({ items, onChangeItem, onAddItem, onRemoveItem }) {
  const levels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'];
  return (
    <SectionShell
      icon={Languages}
      title="Languages"
      description="Useful for global roles. Keep levels honest and simple."
      action={
        <Button variant="soft" size="sm" type="button" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5" />
          Add language
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyHint
          icon={Languages}
          title="No languages yet"
          body="Add languages you can work in. This is optional for many roles."
          actionLabel="Add language"
          onAction={onAddItem}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-end gap-2">
              <Field label="Language" className="flex-1">
                <Input
                  value={item.name}
                  onChange={(event) => onChangeItem(index, { name: event.target.value })}
                  placeholder="Spanish"
                />
              </Field>
              <Field label="Level" className="w-[170px]">
                <Select
                  value={item.level}
                  onChange={(event) => onChangeItem(index, { level: event.target.value })}
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => onRemoveItem(index)}
                aria-label="Remove language"
                className="mb-0.5"
              >
                <Trash2 className="h-4 w-4 text-faint" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

const ACCENTS = ['#1f6f5c', '#143c2f', '#274060', '#7c3aed', '#b1532f', '#a11d3d', '#8a6d1f', '#111827'];

const TEMPLATES = [
  { key: 'minimal', name: 'Minimal', hint: 'Editorial serif, centered header' },
  { key: 'modern', name: 'Modern', hint: 'Deep sidebar, photo-friendly' },
  { key: 'compact', name: 'Compact', hint: 'Dense, two-column entries' },
];

export function DesignSection({ resume, onChange, onOpenShare }) {
  const isPublic = resume.visibility === 'public';

  return (
    <div className="space-y-5">
      <SectionShell
        icon={Palette}
        title="Design"
        description="Switch the layout and accent. Every template is ATS-friendly and fits A4."
      >
        <div className="text-[12px] font-semibold text-ink/85">Template</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {TEMPLATES.map((template) => {
            const active = resume.template === template.key;
            return (
              <button
                key={template.key}
                type="button"
                onClick={() => onChange({ template: template.key })}
                className={cn(
                  'rounded-2xl border p-2 text-left transition',
                  active
                    ? 'border-forest bg-lime-soft/30 ring-2 ring-forest/10'
                    : 'border-line bg-cream/20 hover:border-ink/20'
                )}
                aria-pressed={active}
              >
                <div className="overflow-hidden rounded-lg border border-line bg-white">
                  <ResumeFrame
                    resume={resume}
                    template={template.key}
                    cropHeight={150}
                    placeholder={false}
                  />
                </div>
                <div className="flex items-center justify-between px-1 pt-2">
                  <div>
                    <div className="text-[12px] font-semibold text-ink">{template.name}</div>
                    <div className="text-[10px] text-faint">{template.hint}</div>
                  </div>
                  {active ? <Badge tone="forest" className="text-[9.5px]">In use</Badge> : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-[12px] font-semibold text-ink/85">Accent color</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {ACCENTS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ accent: color })}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-full border transition',
                resume.accent.toLowerCase() === color.toLowerCase()
                  ? 'border-ink/60 ring-2 ring-ink/10 ring-offset-2 ring-offset-paper'
                  : 'border-black/10 hover:scale-105'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Use accent ${color}`}
            >
              {resume.accent.toLowerCase() === color.toLowerCase() ? (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: isLightColor(color) ? '#143c2f' : '#ffffff' }}
                />
              ) : null}
            </button>
          ))}
          <label className="relative ml-1 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-3 text-[11px] text-soft transition hover:border-ink/20">
            <span className="h-4 w-4 rounded-full border border-line" style={{ backgroundColor: resume.accent }} />
            Custom
            <input
              type="color"
              value={resume.accent}
              onChange={(event) => onChange({ accent: event.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom accent color"
            />
          </label>
        </div>
      </SectionShell>

      <SectionShell
        icon={Target}
        title="Sharing & visibility"
        description="Publish a clean, mobile-friendly version of this resume at a private link."
      >
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-cream/30 p-4">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 grid h-8 w-8 place-items-center rounded-full',
                isPublic ? 'bg-lime-soft text-forest' : 'bg-cream-deep text-soft'
              )}
            >
              {isPublic ? <Copy className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
            </span>
            <div>
              <p className="text-[13px] font-medium text-ink">
                {isPublic ? 'This resume is public' : 'This resume is private'}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-faint">
                {isPublic
                  ? 'Anyone with the link can view it. Unpublish anytime without losing the link.'
                  : 'Only you can see it right now. Publish to get a shareable link.'}
              </p>
            </div>
          </div>
          <Button variant={isPublic ? 'outline' : 'primary'} size="sm" onClick={onOpenShare}>
            {isPublic ? 'Manage link' : 'Publish & share'}
          </Button>
        </div>
      </SectionShell>
    </div>
  );
}

export function PhotoStorageBadge({ status }) {
  if (!status) return null;
  return (
    <Badge tone={status.enabled ? 'forest' : 'neutral'} icon={ImageIcon}>
      {status.enabled ? 'ImageKit CDN' : 'Local uploads'}
    </Badge>
  );
}
