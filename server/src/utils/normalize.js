import crypto from 'node:crypto';

export function slugify(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function makeSlug(name, fallback = 'resume') {
  const base = slugify(name) || fallback;
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

const str = (value, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const strArray = (value, max = 40, itemMax = 400) =>
  Array.isArray(value)
    ? value.map((item) => str(item, itemMax)).filter(Boolean).slice(0, max)
    : [];

const list = (value, max = 40) => (Array.isArray(value) ? value.slice(0, max) : []);

const idOf = (item) => (item && typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID());

export function normalizeResume(input = {}) {
  const p = input.personal || {};
  return {
    title: str(input.title, 120) || 'Untitled resume',
    template: ['minimal', 'modern', 'compact'].includes(input.template) ? input.template : 'minimal',
    accent: /^#[0-9a-fA-F]{6}$/.test(input.accent || '') ? input.accent : '#1f6f5c',
    personal: {
      fullName: str(p.fullName, 120),
      title: str(p.title, 120),
      email: str(p.email, 160),
      phone: str(p.phone, 60),
      location: str(p.location, 120),
      website: str(p.website, 200),
      linkedin: str(p.linkedin, 200),
      github: str(p.github, 200),
      summary: str(p.summary, 2000),
      photoUrl: str(p.photoUrl, 600),
    },
    experience: list(input.experience).map((item) => ({
      id: idOf(item),
      role: str(item.role, 120),
      company: str(item.company, 120),
      location: str(item.location, 120),
      startDate: str(item.startDate, 30),
      endDate: str(item.endDate, 30),
      current: Boolean(item.current),
      bullets: strArray(item.bullets, 12, 600),
    })),
    education: list(input.education).map((item) => ({
      id: idOf(item),
      degree: str(item.degree, 160),
      school: str(item.school, 160),
      location: str(item.location, 120),
      startDate: str(item.startDate, 30),
      endDate: str(item.endDate, 30),
      grade: str(item.grade, 80),
      details: str(item.details, 300),
    })),
    projects: list(input.projects).map((item) => ({
      id: idOf(item),
      name: str(item.name, 160),
      link: str(item.link, 220),
      tech: str(item.tech, 160),
      bullets: strArray(item.bullets, 8, 500),
    })),
    skills: strArray(input.skills, 40, 60),
    certifications: list(input.certifications).map((item) => ({
      id: idOf(item),
      name: str(item.name, 160),
      issuer: str(item.issuer, 160),
      date: str(item.date, 40),
      link: str(item.link, 220),
    })),
    languages: list(input.languages).map((item) => ({
      id: idOf(item),
      name: str(item.name, 60),
      level: str(item.level, 60),
    })),
  };
}

export function resumeToText(resume) {
  const p = resume.personal || {};
  return [
    p.fullName,
    p.title,
    p.email,
    p.phone,
    p.location,
    p.website,
    p.linkedin,
    p.github,
    p.summary,
    ...(resume.experience || []).flatMap((e) => [e.role, e.company, e.location, ...(e.bullets || [])]),
    ...(resume.education || []).flatMap((e) => [e.degree, e.school, e.details]),
    ...(resume.projects || []).flatMap((e) => [e.name, e.tech, ...(e.bullets || [])]),
    ...(resume.skills || []),
    ...(resume.certifications || []).flatMap((c) => [c.name, c.issuer]),
    ...(resume.languages || []).flatMap((l) => [l.name, l.level]),
  ]
    .filter(Boolean)
    .join(' \n ');
}
