import { config } from '../config/env.js';
import { resumeToText } from '../utils/normalize.js';

/* ------------------------------------------------------------------ */
/* Provider plumbing: cloud (OpenAI-compatible) → Ollama → built-in   */
/* ------------------------------------------------------------------ */

let ollamaCache = { at: 0, models: [] };

async function ollamaModels() {
  if (config.ollama.disabled) return [];
  if (Date.now() - ollamaCache.at < 30_000) return ollamaCache.models;
  try {
    const res = await fetch(`${config.ollama.url}/api/tags`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    ollamaCache = { at: Date.now(), models };
    return models;
  } catch {
    ollamaCache = { at: Date.now(), models: [] };
    return [];
  }
}

async function pickOllamaModel() {
  const models = await ollamaModels();
  if (!models.length) return null;
  if (models.includes(config.ollama.model)) return config.ollama.model;
  const family = config.ollama.model.split(':')[0];
  return models.find((m) => m.startsWith(family)) || models[0];
}

export async function getAIStatus() {
  if (config.ai.apiKey) {
    return { mode: 'cloud', label: 'Cloud AI', model: config.ai.model, ready: true };
  }
  const model = await pickOllamaModel();
  if (model) return { mode: 'ollama', label: 'Ollama (local)', model, ready: true };
  return { mode: 'builtin', label: 'Built-in writer', model: 'Vitae drafts', ready: true };
}

async function chat({ system, user, json = false, temperature = 0.65, timeout = 60_000 }) {
  if (config.ai.apiKey) {
    try {
      const res = await fetch(`${config.ai.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.ai.apiKey}`,
        },
        body: JSON.stringify({
          model: config.ai.model,
          temperature,
          max_tokens: 900,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          ...(json ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) throw new Error(`AI status ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return { text, provider: config.ai.model };
    } catch (err) {
      console.warn('[ai] cloud provider failed:', err.message);
    }
  }

  const model = await pickOllamaModel();
  if (model) {
    try {
      const res = await fetch(`${config.ollama.url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: false,
          options: { temperature, num_predict: 500 },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          ...(json ? { format: 'json' } : {}),
        }),
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) throw new Error(`Ollama status ${res.status}`);
      const data = await res.json();
      const text = data.message?.content;
      if (text) return { text, provider: `ollama:${model}` };
    } catch (err) {
      console.warn('[ai] ollama failed:', err.message);
    }
  }

  return null;
}

function parseJSON(text) {
  if (!text) return null;
  const cleaned = text
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();
  const starts = [cleaned.indexOf('{'), cleaned.indexOf('[')].filter((i) => i >= 0);
  if (!starts.length) return null;
  const start = Math.min(...starts);
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Local writing engine (always available)                            */
/* ------------------------------------------------------------------ */

const FAMILIES = [
  { key: 'fullstack', words: ['full-stack', 'fullstack', 'full stack'] },
  { key: 'frontend', words: ['frontend', 'front-end', 'front end', 'react', 'ui engineer', 'web developer', 'javascript developer'] },
  { key: 'backend', words: ['backend', 'back-end', 'back end', 'api engineer', 'server', 'node', 'golang', 'java developer', 'python'] },
  { key: 'data', words: ['data scientist', 'data analyst', 'machine learning', 'ml engineer', 'ai engineer', 'analytics'] },
  { key: 'design', words: ['designer', 'ux', 'ui/ux', 'product design', 'visual'] },
  { key: 'product', words: ['product manager', 'product owner', 'program manager', ' pm '] },
  { key: 'devops', words: ['devops', 'sre', 'platform engineer', 'cloud engineer', 'infrastructure'] },
  { key: 'mobile', words: ['mobile', 'ios', 'android', 'react native', 'flutter'] },
  { key: 'marketing', words: ['marketing', 'growth', 'seo', 'content', 'brand', 'social media'] },
];

const BULLETS = {
  frontend: [
    'Built and shipped responsive, accessible interfaces in React and TypeScript, improving performance and usability across devices.',
    'Partnered with design and product to translate Figma specs into reusable, well-tested components used across {company}.',
    'Cut bundle size and load times by introducing code-splitting, caching, and performance budgets in CI.',
    'Raised accessibility to WCAG AA by auditing core flows and fixing keyboard and screen-reader issues.',
    'Added end-to-end coverage with Playwright, reducing UI regressions and shortening release cycles.',
  ],
  backend: [
    'Designed and shipped REST and GraphQL APIs in Node.js, handling thousands of requests per minute with p99 latency under 200ms.',
    'Modeled data in MongoDB and PostgreSQL, adding indexes and caching that cut average query time by 40%.',
    'Hardened services with input validation, rate limiting, and structured logging; reduced error rate by 35%.',
    'Automated deployments at {company} with Docker and CI checks, shrinking release time from hours to minutes.',
    'Collaborated with frontend teams on API contracts and versioning, keeping integrations stable as the product grew.',
  ],
  fullstack: [
    'Owned features end to end at {company}, from data modeling and APIs to polished React interfaces and rollout.',
    'Re-architected a monolithic flow into modular services, improving reliability and cutting page load time by 45%.',
    'Built a design-system-backed component library adopted by multiple teams, accelerating delivery.',
    'Set up CI/CD, automated testing, and observability, reducing production incidents by 30%.',
    'Mentored engineers through code reviews and pairing, raising overall code quality and delivery speed.',
  ],
  data: [
    'Built and maintained ETL pipelines processing millions of events daily, improving freshness from hours to minutes.',
    'Developed dashboards and self-serve reports that informed roadmap decisions for leadership at {company}.',
    'Trained and evaluated models with rigorous offline and online testing, lifting key prediction accuracy by 12%.',
    'Partnered with product teams to define metrics and experiments, turning ambiguous questions into measurable outcomes.',
    'Documented data definitions and quality checks, reducing recurring data discrepancies.',
  ],
  design: [
    'Led end-to-end product design at {company}, from research and flows to high-fidelity interfaces and dev handoff.',
    'Ran usability studies and synthesized insights into focused improvements that increased task completion rates.',
    'Built and maintained a design system in Figma, improving consistency and speeding up delivery.',
    'Partnered closely with engineering to ship accessible, pixel-perfect features on schedule.',
    'Facilitated design reviews and critiques, raising craft quality across the team.',
  ],
  product: [
    'Owned the roadmap for a core product area at {company}, prioritizing with data, customer interviews, and business goals.',
    'Led cross-functional delivery across design and engineering, shipping on time and improving activation by 20%.',
    'Defined success metrics and ran experiments, using results to double down or stop initiatives quickly.',
    'Mapped customer journeys and removed friction points that drove a measurable drop in support tickets.',
    'Communicated tradeoffs and progress clearly to stakeholders at every level.',
  ],
  devops: [
    'Automated infrastructure with Terraform and CI/CD, reducing manual release work by 80%.',
    'Improved reliability at {company} by adding observability, alerting, and runbooks for critical services.',
    'Migrated workloads to containers and a managed orchestrator, cutting infra costs while improving deploy speed.',
    'Hardened security posture with least-privilege access, secret rotation, and dependency scanning.',
    'Led incident response and postmortems, reducing repeat outages.',
  ],
  mobile: [
    'Shipped consumer mobile features at {company} in React Native, improving retention and store ratings.',
    'Optimized app startup and rendering, cutting cold-start time by 35% on mid-range devices.',
    'Built offline-first flows with local persistence and background sync.',
    'Integrated native modules and APIs, keeping releases smooth across iOS and Android.',
    'Added automated tests and release automation, reducing hotfixes.',
  ],
  marketing: [
    'Owned growth experiments at {company}, improving qualified signups by 25% through testing and channel optimization.',
    'Built SEO content strategy that grew organic traffic and pipeline over consecutive quarters.',
    'Ran lifecycle campaigns across email and in-product, lifting activation and retention.',
    'Analyzed funnel data to prioritize initiatives and report results to leadership.',
    'Partnered with product and sales to keep messaging consistent end to end.',
  ],
  general: [
    'Owned key initiatives end to end at {company}, delivering on time and to a high quality bar.',
    'Collaborated across teams to clarify requirements, remove blockers, and keep work moving.',
    'Improved processes and documentation, reducing rework and onboarding time.',
    'Used data to prioritize work and measure the impact of improvements.',
    'Communicated progress and tradeoffs clearly to stakeholders.',
  ],
};

const SKILLS = {
  frontend: ['React', 'TypeScript', 'JavaScript (ES2023)', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'Vite', 'Jest', 'Playwright', 'Accessibility (WCAG)', 'Core Web Vitals', 'REST APIs'],
  backend: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'Docker', 'AWS', 'Jest', 'API design', 'Message queues'],
  fullstack: ['React', 'Node.js', 'TypeScript', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs', 'GraphQL', 'Docker', 'AWS', 'CI/CD', 'Testing'],
  data: ['Python', 'SQL', 'Pandas', 'scikit-learn', 'PyTorch', 'Airflow', 'dbt', 'Snowflake', 'Tableau', 'A/B testing', 'Statistics', 'Data modeling'],
  design: ['Figma', 'Prototyping', 'Design systems', 'User research', 'Usability testing', 'Interaction design', 'Accessibility', 'Information architecture', 'Design critique'],
  product: ['Roadmapping', 'Discovery', 'A/B testing', 'SQL', 'Analytics', 'Stakeholder management', 'Agile', 'Prioritization', 'Product strategy'],
  devops: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'GitHub Actions', 'Prometheus', 'Grafana', 'Linux', 'CI/CD', 'Incident response'],
  mobile: ['React Native', 'TypeScript', 'Swift', 'Kotlin', 'Redux', 'REST APIs', 'App Store deployment', 'Performance profiling', 'Offline-first'],
  marketing: ['SEO', 'Content strategy', 'Google Analytics', 'Email marketing', 'A/B testing', 'HubSpot', 'Paid acquisition', 'Copywriting', 'CRM'],
  general: ['Project management', 'Communication', 'Problem solving', 'Data analysis', 'Stakeholder management', 'Documentation', 'Collaboration', 'Ownership'],
};

function detectFamily(role = '') {
  const value = ` ${role.toLowerCase()} `;
  const found = FAMILIES.find((f) => f.words.some((w) => value.includes(w)));
  return found ? found.key : 'general';
}

function clean(value = '', max = 200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function pick(list, count) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function localSummary({ role, years, skills = [], highlights = '' }) {
  const r = clean(role, 80) || 'Professional';
  const exp = Number(years) > 0 ? `${years}+ years of experience` : 'hands-on experience';
  const top = (Array.isArray(skills) ? skills : []).map((s) => clean(s, 40)).filter(Boolean).slice(0, 4);
  const first = `${r} with ${exp} building thoughtful, reliable products end to end.`;
  const second = top.length
    ? ` Deep hands-on expertise in ${top.join(', ')}, with a bias toward clean systems, measurable outcomes, and accessible experiences.`
    : ' Comfortable owning a problem from discovery through launch, with a bias toward measurable outcomes and clean systems.';
  const third = highlights
    ? ` Recent wins: ${clean(highlights, 180).replace(/\.$/, '')}.`
    : ' Known for clear communication, strong ownership, and mentoring teammates while raising the quality bar.';
  return { summary: `${first}${second}${third}` };
}

function localBullets({ role, company, description, count = 4 }) {
  const family = detectFamily(role);
  const pool = BULLETS[family] || BULLETS.general;
  const target = Math.min(Math.max(Number(count) || 4, 2), 6);
  const org = clean(company, 60) || 'the team';
  const focusWords = [...new Set(
    clean(description, 600)
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !LOCAL_STOPWORDS.has(w))
  )].slice(0, 3);

  const chosen = pick(pool, target).map((b) => b.replaceAll('{company}', org));
  if (focusWords.length) {
    chosen.unshift(
      `Drove ${focusWords.join(', ')} work at ${org}, turning requirements into shipped, well-tested outcomes.`
    );
  }
  return { bullets: chosen.slice(0, target) };
}

function localSkills({ role, existing = [] }) {
  const family = detectFamily(role);
  const have = new Set((Array.isArray(existing) ? existing : []).map((s) => clean(s, 40).toLowerCase()));
  const suggestions = (SKILLS[family] || SKILLS.general).filter((s) => !have.has(s.toLowerCase())).slice(0, 10);
  return { skills: suggestions };
}

function localImprove({ text = '' }) {
  let value = clean(text, 600).replace(/^[-•*\s]+/, '');
  const swaps = [
    [/^responsible for\s+/i, 'Owned '],
    [/^worked on\s+/i, 'Delivered '],
    [/^helped (to )?/i, 'Partnered to '],
    [/^assisted (with|in)\s+/i, 'Supported '],
    [/^in charge of\s+/i, 'Led '],
    [/^duties included\s+/i, 'Delivered '],
    [/^tasked with\s+/i, 'Drove '],
  ];
  for (const [pattern, replacement] of swaps) {
    if (pattern.test(value)) {
      value = value.replace(pattern, replacement);
      break;
    }
  }
  value = value
    .replace(/\bvery\s+/gi, '')
    .replace(/\bsuccessfully\s+/gi, '')
    .replace(/\bvarious\s+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  value = value.charAt(0).toUpperCase() + value.slice(1);
  if (value && !/[.!?]$/.test(value)) value += '.';
  return { text: value };
}

const LOCAL_STOPWORDS = new Set([
  'with', 'that', 'this', 'from', 'have', 'will', 'your', 'their', 'about', 'into', 'over', 'under',
  'team', 'teams', 'work', 'working', 'experience', 'years', 'role', 'company', 'candidate', 'looking',
  'strong', 'good', 'plus', 'must', 'should', 'would', 'could', 'able', 'ability', 'including',
  'across', 'using', 'build', 'building', 'develop', 'developing', 'help', 'within', 'while', 'other',
  'more', 'than', 'then', 'them', 'they', 'you', 'our', 'are', 'and', 'the', 'for', 'with', 'who',
  'what', 'when', 'where', 'how', 'why', 'all', 'any', 'can', 'may', 'not', 'but', 'out', 'own',
  'job', 'position', 'responsibilities', 'requirements', 'preferred', 'required', 'nice', 'etc',
  'high', 'great', 'excellent', 'relevant', 'related', 'new', 'well', 'also', 'such', 'make', 'made',
]);

/* ------------------------------------------------------------------ */
/* Public generators                                                  */
/* ------------------------------------------------------------------ */

async function generate(prompt, fallback) {
  const result = await chat(prompt);
  if (result?.text) {
    const parsed = parseJSON(result.text);
    if (parsed && typeof parsed === 'object') {
      return { ...parsed, provider: result.provider, ai: true };
    }
  }
  return { ...fallback(), provider: 'builtin', ai: false };
}

export async function generateSummary(input = {}) {
  const role = clean(input.role, 100) || 'professional';
  const years = clean(input.years, 10);
  const skills = (Array.isArray(input.skills) ? input.skills : []).slice(0, 10).map((s) => clean(s, 40));
  const highlights = clean(input.highlights, 400);
  return generate(
    {
      json: true,
      temperature: 0.6,
      system:
        'You are an expert resume writer. Reply with JSON only, shape: {"summary": string}. Write 2-3 concise sentences (max 70 words), third person without pronouns, no clichés, no invented employers or numbers.',
      user: `Target role: ${role}\nYears of experience: ${years || 'unspecified'}\nTop skills: ${skills.join(', ') || 'unspecified'}\nHighlights: ${highlights || 'none'}\nWrite the professional summary.`,
    },
    () => localSummary({ role, years, skills, highlights })
  );
}

export async function generateBullets(input = {}) {
  const role = clean(input.role, 100) || 'professional';
  const company = clean(input.company, 100);
  const description = clean(input.description, 600);
  const count = Math.min(Math.max(Number(input.count) || 4, 2), 6);
  const result = await generate(
    {
      json: true,
      temperature: 0.65,
      system:
        'You are an expert resume writer. Reply with JSON only, shape: {"bullets": [string]}. Each bullet starts with a strong past-tense action verb, is one line, specific, and mentions measurable outcomes only when plausible. No clichés.',
      user: `Role: ${role}\nCompany: ${company || 'unspecified'}\nContext: ${description || 'none'}\nWrite exactly ${count} resume bullets.`,
    },
    () => localBullets({ role, company, description, count })
  );
  const bullets = (Array.isArray(result.bullets) ? result.bullets : [])
    .map((b) => clean(b, 500))
    .filter(Boolean)
    .slice(0, count);
  if (!bullets.length) {
    return { ...localBullets({ role, company, description, count }), provider: 'builtin', ai: false };
  }
  return { bullets, provider: result.provider, ai: Boolean(result.ai) };
}

export async function suggestSkills(input = {}) {
  const role = clean(input.role, 100) || 'professional';
  const existing = (Array.isArray(input.existing) ? input.existing : []).slice(0, 40).map((s) => clean(s, 40));
  const result = await generate(
    {
      json: true,
      temperature: 0.5,
      system:
        'You are a technical recruiter. Reply with JSON only, shape: {"skills": [string]}. Return 8-10 relevant hard skills, each 1-3 words, no duplicates of existing skills, no soft skills.',
      user: `Role: ${role}\nExisting skills: ${existing.join(', ') || 'none'}`,
    },
    () => localSkills({ role, existing })
  );
  const have = new Set(existing.map((s) => s.toLowerCase()));
  const skills = [...new Set((Array.isArray(result.skills) ? result.skills : [])
    .map((s) => clean(s, 40))
    .filter((s) => s && !have.has(s.toLowerCase())))].slice(0, 10);
  if (!skills.length) return { ...localSkills({ role, existing }), provider: 'builtin', ai: false };
  return { skills, provider: result.provider, ai: Boolean(result.ai) };
}

export async function improveText(input = {}) {
  const text = clean(input.text, 600);
  if (!text) return { text: '', provider: 'builtin', ai: false };
  const result = await generate(
    {
      json: true,
      temperature: 0.55,
      system:
        'You are an expert resume editor. Reply with JSON only, shape: {"text": string}. Rewrite the bullet to be concise and specific, start with a strong action verb, remove clichés and filler, keep every fact unchanged, one line, max 45 words.',
      user: `Original: ${text}`,
    },
    () => localImprove({ text })
  );
  const improved = clean(result.text, 600);
  return {
    text: improved || localImprove({ text }).text,
    provider: result.provider,
    ai: Boolean(result.ai),
  };
}

const SKILL_DICTIONARY = [
  'javascript', 'typescript', 'react', 'next.js', 'node.js', 'express', 'mongodb', 'postgresql',
  'mysql', 'redis', 'graphql', 'rest', 'api', 'python', 'django', 'flask', 'java', 'spring',
  'golang', 'rust', 'c++', 'c#', '.net', 'php', 'laravel', 'ruby', 'rails', 'swift', 'kotlin',
  'react native', 'flutter', 'android', 'ios', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'redux', 'vite', 'webpack', 'jest', 'cypress', 'playwright', 'testing', 'tdd', 'ci/cd',
  'docker', 'kubernetes', 'terraform', 'ansible', 'aws', 'gcp', 'azure', 'linux', 'git',
  'github actions', 'jenkins', 'nginx', 'microservices', 'kafka', 'rabbitmq', 'websockets',
  'sql', 'nosql', 'data modeling', 'etl', 'airflow', 'dbt', 'snowflake', 'bigquery', 'spark',
  'pandas', 'numpy', 'pytorch', 'tensorflow', 'scikit-learn', 'machine learning', 'nlp',
  'computer vision', 'llm', 'generative ai', 'prompt engineering', 'tableau', 'power bi',
  'looker', 'analytics', 'a/b testing', 'seo', 'figma', 'sketch', 'adobe xd', 'photoshop',
  'illustrator', 'design systems', 'user research', 'usability testing', 'prototyping',
  'accessibility', 'responsive design', 'agile', 'scrum', 'kanban', 'jira', 'product strategy',
  'roadmap', 'stakeholder management', 'leadership', 'mentoring', 'communication', 'salesforce',
  'hubspot', 'google analytics', 'content marketing', 'email marketing', 'copywriting',
  'performance optimization', 'core web vitals', 'security', 'oauth', 'jwt', 'firebase',
  'supabase', 'mongodb atlas', 'imagekit', 'cloudinary', 'stripe', 'webhooks'
];

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'has', 'are', 'was', 'were', 'you',
  'your', 'our', 'their', 'will', 'would', 'should', 'could', 'can', 'may', 'must', 'not', 'but',
  'all', 'any', 'own', 'out', 'who', 'what', 'when', 'where', 'how', 'why', 'job', 'role', 'work',
  'working', 'experience', 'years', 'team', 'teams', 'company', 'candidate', 'looking', 'plus',
  'including', 'across', 'using', 'build', 'building', 'develop', 'developing', 'help', 'within',
  'while', 'other', 'more', 'than', 'then', 'them', 'they', 'about', 'into', 'over', 'under',
  'responsibilities', 'requirements', 'preferred', 'required', 'nice', 'etc', 'strong', 'good',
  'excellent', 'relevant', 'related', 'new', 'well', 'also', 'such', 'make', 'made', 'join',
  'benefits', 'salary', 'apply', 'position', 'description', 'qualifications', 'skills', 'ability',
  'knowledge', 'understanding', 'familiarity', 'environment', 'opportunity', 'ideal',
]);

export function analyzeATS(resume, jobDescription) {
  const jd = clean(jobDescription, 12000).toLowerCase();
  const resumeText = resumeToText(resume).toLowerCase();
  const email = resume?.personal?.email || '';
  const phone = resume?.personal?.phone || '';
  const summary = resume?.personal?.summary || '';
  const experience = resume?.experience || [];
  const skills = resume?.skills || [];
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  const frequency = new Map();
  for (const word of jd.match(/[a-z][a-z0-9+#./-]{2,}/g) || []) {
    const token = word.replace(/[.,/]+$/, '');
    if (STOPWORDS.has(token) || token.length < 3) continue;
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  const known = SKILL_DICTIONARY.filter((skill) => jd.includes(skill));
  const frequent = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => !known.some((skill) => skill.includes(word) || word.includes(skill)));

  const keywords = [...new Set([...known, ...frequent])].slice(0, 28);
  const matched = [];
  const missing = [];
  for (const keyword of keywords) {
    const variants = [keyword, keyword.replace(/\./g, '')];
    if (variants.some((v) => resumeText.includes(v))) matched.push(keyword);
    else missing.push(keyword);
  }

  const bulletsWithNumbers = experience
    .flatMap((e) => e.bullets || [])
    .filter((b) => /\d/.test(b)).length;

  const checks = [
    { id: 'contact', label: 'Contact details', ok: Boolean(email && phone), hint: 'Add both an email and a phone number.' },
    { id: 'summary', label: 'Professional summary', ok: summary.trim().length >= 80, hint: 'Write a 2-3 sentence summary tailored to the role.' },
    { id: 'experience', label: 'Work experience', ok: experience.length >= 1, hint: 'Add at least one relevant role.' },
    { id: 'impact', label: 'Measurable impact', ok: bulletsWithNumbers >= 2, hint: 'Quantify at least two bullets with numbers, %, or time saved.' },
    { id: 'skills', label: 'Skills section', ok: skills.length >= 6, hint: 'List at least six role-relevant skills.' },
    { id: 'education', label: 'Education', ok: (resume.education || []).length >= 1, hint: 'Add your highest qualification.' },
    { id: 'dates', label: 'Role dates', ok: experience.length > 0 && experience.every((e) => e.startDate), hint: 'Add a start date to every role.' },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const coverage = keywords.length ? matched.length / keywords.length : 0;
  const lengthPoints = wordCount >= 180 ? 15 : wordCount >= 90 ? 10 : 5;
  const score = Math.min(98, Math.round(coverage * 55 + (passed / checks.length) * 30 + lengthPoints));

  const suggestions = [];
  if (missing.length) {
    suggestions.push(`Weave in missing keywords where they are true: ${missing.slice(0, 5).join(', ')}.`);
  }
  for (const check of checks.filter((c) => !c.ok)) suggestions.push(check.hint);
  if (wordCount < 180) suggestions.push('Your resume is short. Add detail to experience bullets and projects (aim for 300-600 words).');
  if (wordCount > 900) suggestions.push('Your resume is long. Tighten bullets to the most relevant achievements.');
  if (!suggestions.length) suggestions.push('Strong match. Mirror a few exact phrases from the job description in your summary and top bullets.');

  const grade = score >= 80 ? 'Strong match' : score >= 60 ? 'Good start' : 'Needs work';
  return {
    score,
    grade,
    matched: matched.slice(0, 18),
    missing: missing.slice(0, 12),
    checks,
    suggestions: suggestions.slice(0, 6),
    keywordsTotal: keywords.length,
    wordCount,
  };
}
