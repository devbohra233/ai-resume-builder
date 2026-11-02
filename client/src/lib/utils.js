export const cn = (...classes) => classes.filter(Boolean).join(' ');

export function initials(name = '') {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || '')
      .join('')
      .toUpperCase() || 'V'
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonth(value) {
  if (!value) return '';
  const [year, month] = String(value).split('-');
  const index = Number(month) - 1;
  if (!year) return String(value);
  if (!month || index < 0 || index > 11) return year;
  return `${MONTHS[index]} ${year}`;
}

export function formatRange(start, end, current) {
  const from = formatMonth(start);
  const to = current ? 'Present' : formatMonth(end);
  if (from && to) return `${from} — ${to}`;
  return from || to || '';
}

export function formatRelative(date) {
  if (!date) return '';
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 60) return 'just now';
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, seconds] of units) {
    if (abs >= seconds) return rtf.format(Math.round(diff / seconds), unit);
  }
  return 'just now';
}

export function stripProtocol(url = '') {
  return String(url)
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
}

export function hexLuminance(hex = '#1f6f5c') {
  const value = hex.replace('#', '');
  if (value.length !== 6) return 0.2;
  const rgb = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function isLightColor(hex) {
  return hexLuminance(hex) > 0.55;
}

export function filenameFromResume(resume) {
  const name = resume?.personal?.fullName || resume?.title || 'resume';
  return `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'resume'}-resume.pdf`;
}

export function displayUrl(url = '') {
  const clean = stripProtocol(url);
  return clean || url;
}

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function newExperience() {
  return {
    id: uid(),
    role: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: [''],
  };
}

export function newEducation() {
  return {
    id: uid(),
    degree: '',
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    grade: '',
    details: '',
  };
}

export function newProject() {
  return { id: uid(), name: '', link: '', tech: '', bullets: [''] };
}

export function newCertification() {
  return { id: uid(), name: '', issuer: '', date: '', link: '' };
}

export function newLanguage() {
  return { id: uid(), name: '', level: 'Fluent' };
}

export function resumeStrength(resume) {
  if (!resume) return { percent: 0, missing: [] };
  const checks = [
    { ok: Boolean(resume.personal?.fullName && resume.personal?.title), hint: 'Add your name and target role' },
    { ok: Boolean(resume.personal?.email && resume.personal?.phone), hint: 'Add contact details' },
    { ok: (resume.personal?.summary || '').length >= 80, hint: 'Write a tailored summary' },
    { ok: (resume.experience || []).some((e) => e.role && (e.bullets || []).filter(Boolean).length >= 2), hint: 'Add a role with 2+ bullets' },
    { ok: (resume.education || []).some((e) => e.school || e.degree), hint: 'Add education' },
    { ok: (resume.skills || []).length >= 5, hint: 'Add at least 5 skills' },
    { ok: (resume.projects || []).length > 0 || (resume.certifications || []).length > 0, hint: 'Add a project or certification' },
    { ok: Boolean(resume.personal?.photoUrl) || (resume.languages || []).length > 0, hint: 'Add a photo or languages' },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return {
    percent: Math.round((passed / checks.length) * 100),
    missing: checks.filter((c) => !c.ok).map((c) => c.hint),
  };
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}
