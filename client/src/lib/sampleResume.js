const base = {
  title: 'Senior Product Engineer — Sample',
  template: 'modern',
  accent: '#1f6f5c',
  personal: {
    fullName: 'Jordan Ellis',
    title: 'Senior Product Engineer',
    email: 'jordan.ellis@example.com',
    phone: '+1 (415) 555-0134',
    location: 'San Francisco, CA',
    website: 'jordanellis.dev',
    linkedin: 'linkedin.com/in/jordanellis',
    github: 'github.com/jordanellis',
    summary:
      'Senior product engineer with 8+ years of experience building fast, accessible web products end to end. Led cross-functional teams to ship features used by 2M+ people, and cut page-load times by 45% through architectural redesigns. Comfortable owning a problem from Figma to production.',
    photoUrl: '',
  },
  experience: [
    {
      id: 'sample-exp-1',
      role: 'Staff Software Engineer',
      company: 'Northwind Labs',
      location: 'San Francisco, CA',
      startDate: '2021-01',
      endDate: '',
      current: true,
      bullets: [
        'Led a team of 6 engineers to rebuild the core checkout flow in React and Node.js, lifting conversion by 18% and reducing support tickets by 32%.',
        'Architected a shared component library adopted by 4 product teams, cutting UI development time by roughly 30%.',
        'Introduced Core Web Vitals budgets and CI performance checks, raising Lighthouse scores from 68 to 96 across key pages.',
      ],
    },
    {
      id: 'sample-exp-2',
      role: 'Senior Frontend Engineer',
      company: 'Brightline',
      location: 'Remote',
      startDate: '2018-03',
      endDate: '2020-12',
      current: false,
      bullets: [
        'Shipped a real-time analytics dashboard used by 40k+ customers, built with React, TypeScript, and WebSockets.',
        'Migrated a legacy jQuery app to React and Vite, shrinking the bundle by 52% and cutting build times by 4x.',
        'Mentored 3 junior engineers and established review guidelines that reduced production regressions by 25%.',
      ],
    },
    {
      id: 'sample-exp-3',
      role: 'Software Engineer',
      company: 'Fieldnote',
      location: 'Berkeley, CA',
      startDate: '2016-06',
      endDate: '2018-02',
      current: false,
      bullets: [
        'Built offline-first features for a field data collection app serving NGOs in 12 countries.',
        'Automated the release pipeline with GitHub Actions, reducing deploy time from 40 minutes to under 8.',
      ],
    },
  ],
  education: [
    {
      id: 'sample-edu-1',
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2012-08',
      endDate: '2016-05',
      grade: 'GPA 3.8 / 4.0',
      details: 'Minor in Cognitive Science · Regents Scholar',
    },
  ],
  projects: [
    {
      id: 'sample-proj-1',
      name: 'Pulse — open-source uptime monitor',
      link: 'github.com/jordanellis/pulse',
      tech: 'React · Node.js · Redis',
      bullets: [
        'Built a self-hosted monitoring tool with alerting and a public status page; 3.4k GitHub stars.',
      ],
    },
    {
      id: 'sample-proj-2',
      name: 'Design Tokens Studio plugin',
      link: 'figma.com/community',
      tech: 'Figma plugin · TypeScript',
      bullets: ['Automated design-token sync between Figma and production codebases for 1,200+ installs.'],
    },
  ],
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'MongoDB',
    'PostgreSQL',
    'GraphQL',
    'AWS',
    'Docker',
    'CI/CD',
    'Jest',
    'Playwright',
    'Figma',
    'Accessibility',
  ],
  certifications: [
    {
      id: 'sample-cert-1',
      name: 'AWS Certified Developer – Associate',
      issuer: 'Amazon Web Services',
      date: '2023',
      link: '',
    },
  ],
  languages: [
    { id: 'sample-lang-1', name: 'English', level: 'Native' },
    { id: 'sample-lang-2', name: 'Spanish', level: 'Professional' },
  ],
};

export function sampleResume(template = 'modern', accent) {
  const clone = JSON.parse(JSON.stringify(base));
  clone.template = template;
  if (accent) clone.accent = accent;
  return clone;
}

export default base;
