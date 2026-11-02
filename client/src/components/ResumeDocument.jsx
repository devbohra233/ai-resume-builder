import { cn, displayUrl, formatRange, initials, isLightColor } from '../lib/utils';

function Bullets({ items }) {
  const list = (items || []).map((b) => String(b || '').trim()).filter(Boolean);
  if (!list.length) return null;
  return (
    <ul className="rd-bullets">
      {list.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function contactItems(personal = {}) {
  return [
    personal.email,
    personal.phone,
    personal.location,
    personal.website ? displayUrl(personal.website) : '',
    personal.linkedin ? displayUrl(personal.linkedin) : '',
    personal.github ? displayUrl(personal.github) : '',
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);
}

const hasExperience = (item) =>
  Boolean(item?.role || item?.company || (item?.bullets || []).some((b) => String(b).trim()));

const hasEducation = (item) => Boolean(item?.school || item?.degree);
const hasProject = (item) => Boolean(item?.name || (item?.bullets || []).some((b) => String(b).trim()));
const hasCert = (item) => Boolean(item?.name);

const accentOf = (resume) => resume?.accent || '#1f6f5c';

function Range({ item }) {
  const value = formatRange(item.startDate, item.endDate, item.current);
  return value ? <div className="rd-meta">{value}</div> : null;
}

/* ------------------------------------------------------------------ */
/* Minimal — editorial serif                                           */
/* ------------------------------------------------------------------ */

function MinimalSection({ title, children }) {
  return (
    <section className="min-section">
      <h2 className="min-sec-title">{title}</h2>
      {children}
    </section>
  );
}

function MinimalTemplate({ resume, placeholder }) {
  const p = resume.personal || {};
  const contacts = contactItems(p);
  const summary = (p.summary || '').trim();
  const experience = (resume.experience || []).filter(hasExperience);
  const education = (resume.education || []).filter(hasEducation);
  const projects = (resume.projects || []).filter(hasProject);
  const certifications = (resume.certifications || []).filter(hasCert);
  const languages = (resume.languages || []).filter((l) => l.name);
  const skills = (resume.skills || []).filter(Boolean);

  return (
    <div className="resume-doc tpl-minimal" style={{ '--accent': accentOf(resume) }}>
      <header className="min-head">
        <h1 className="min-name">
          {p.fullName?.trim() || (placeholder ? <span className="ph">Your Name</span> : ' ')}
        </h1>
        {p.title?.trim() ? (
          <p className="min-role">{p.title}</p>
        ) : placeholder ? (
          <p className="min-role ph">Target role</p>
        ) : null}
        {contacts.length ? (
          <div className="min-contacts">
            {contacts.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        ) : placeholder ? (
          <div className="min-contacts ph">
            <span>you@email.com</span>
            <span>+1 (555) 000-0000</span>
            <span>City, Country</span>
          </div>
        ) : null}
      </header>

      {(summary || placeholder) && (
        <MinimalSection title="Summary">
          <p className={cn('min-summary', !summary && 'ph')}>
            {summary ||
              'Write two sentences that connect your experience to the role you want. Lead with scope and impact.'}
          </p>
        </MinimalSection>
      )}

      {experience.length > 0 && (
        <MinimalSection title="Experience">
          {experience.map((item) => (
            <div className="rd-entry" key={item.id}>
              <div className="rd-entry-top">
                <div>
                  <div className="rd-role">{item.role || 'Role'}</div>
                  <div className="rd-org">
                    {[item.company, item.location].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <Range item={item} />
              </div>
              <Bullets items={item.bullets} />
            </div>
          ))}
        </MinimalSection>
      )}

      {projects.length > 0 && (
        <MinimalSection title="Projects">
          {projects.map((item) => (
            <div className="rd-entry" key={item.id}>
              <div className="rd-entry-top">
                <div>
                  <div className="rd-role">{item.name || 'Project'}</div>
                  {item.link ? <div className="rd-org">{displayUrl(item.link)}</div> : null}
                </div>
                {item.tech ? <div className="rd-meta">{item.tech}</div> : null}
              </div>
              <Bullets items={item.bullets} />
            </div>
          ))}
        </MinimalSection>
      )}

      {education.length > 0 && (
        <MinimalSection title="Education">
          {education.map((item) => (
            <div className="rd-entry" key={item.id}>
              <div className="rd-entry-top">
                <div>
                  <div className="rd-role">{item.degree || 'Degree'}</div>
                  <div className="rd-org">
                    {[item.school, item.location].filter(Boolean).join(' · ')}
                  </div>
                  {item.grade ? <div className="min-inline-extra">{item.grade}</div> : null}
                </div>
                <Range item={item} />
              </div>
              {item.details ? <div className="min-inline-extra">{item.details}</div> : null}
            </div>
          ))}
        </MinimalSection>
      )}

      {skills.length > 0 && (
        <MinimalSection title="Skills">
          <p className="min-skill-line">
            {skills.map((skill, index) => (
              <span key={`${skill}-${index}`}>{skill}</span>
            ))}
          </p>
        </MinimalSection>
      )}

      {certifications.length > 0 && (
        <MinimalSection title="Certifications">
          {certifications.map((item) => (
            <div className="rd-entry" key={item.id}>
              <div className="rd-entry-top">
                <div>
                  <div className="rd-role">{item.name}</div>
                  {item.issuer ? <div className="rd-org">{item.issuer}</div> : null}
                </div>
                {item.date ? <div className="rd-meta">{item.date}</div> : null}
              </div>
            </div>
          ))}
        </MinimalSection>
      )}

      {languages.length > 0 && (
        <MinimalSection title="Languages">
          <p className="min-skill-line">
            {languages.map((lang, index) => (
              <span key={lang.id || index}>
                {lang.name}
                {lang.level ? ` (${lang.level})` : ''}
              </span>
            ))}
          </p>
        </MinimalSection>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modern — accent sidebar                                             */
/* ------------------------------------------------------------------ */

function ModernTemplate({ resume, placeholder }) {
  const p = resume.personal || {};
  const accent = accentOf(resume);
  const lightSide = isLightColor(accent);
  const contacts = contactItems(p);
  const summary = (p.summary || '').trim();
  const experience = (resume.experience || []).filter(hasExperience);
  const education = (resume.education || []).filter(hasEducation);
  const projects = (resume.projects || []).filter(hasProject);
  const certifications = (resume.certifications || []).filter(hasCert);
  const languages = (resume.languages || []).filter((l) => l.name);
  const skills = (resume.skills || []).filter(Boolean);

  return (
    <div className="resume-doc tpl-modern" style={{ '--accent': accent }}>
      <aside className={cn('mod-side', lightSide && 'light')}>
        <div className="mod-photo">
          {p.photoUrl ? (
            <img src={p.photoUrl} alt="" crossOrigin="anonymous" />
          ) : (
            <span className="mod-initials">{initials(p.fullName || 'Vitae')}</span>
          )}
        </div>

        <div className="mod-identity">
          <div className="mod-name">
            {p.fullName?.trim() || (placeholder ? 'Your Name' : ' ')}
          </div>
          {p.title?.trim() ? <div className="mod-role">{p.title}</div> : null}
        </div>

        {contacts.length > 0 && (
          <div>
            <div className="mod-block-title">Contact</div>
            <ul className="mod-contact">
              {contacts.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <div className="mod-block-title">Skills</div>
            <div className="mod-chips">
              {skills.map((skill, index) => (
                <span className="mod-chip" key={`${skill}-${index}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <div className="mod-block-title">Certifications</div>
            {certifications.map((item) => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.4 }}>{item.name}</div>
                {(item.issuer || item.date) && (
                  <div style={{ fontSize: 9, opacity: 0.72, marginTop: 1 }}>
                    {[item.issuer, item.date].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <div className="mod-block-title">Languages</div>
            {languages.map((lang) => (
              <div className="mod-pair" key={lang.id}>
                <span>{lang.name}</span>
                <span>{lang.level}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      <main className="mod-main">
        {(summary || placeholder) && (
          <p className={cn('mod-summary', !summary && 'ph')}>
            {summary ||
              'A short summary that connects your experience, strengths, and the impact you want to make next.'}
          </p>
        )}

        {experience.length > 0 && (
          <section className="mod-section">
            <h2 className="mod-sec-title">Experience</h2>
            {experience.map((item) => (
              <div className="rd-entry" key={item.id}>
                <div className="rd-entry-top">
                  <div>
                    <div className="rd-role">{item.role || 'Role'}</div>
                    <div className="rd-org">
                      {[item.company, item.location].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <Range item={item} />
                </div>
                <Bullets items={item.bullets} />
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className="mod-section">
            <h2 className="mod-sec-title">Projects</h2>
            {projects.map((item) => (
              <div className="rd-entry" key={item.id}>
                <div className="rd-entry-top">
                  <div>
                    <div className="rd-role">
                      {item.name || 'Project'}
                      {item.link ? <span className="rd-link"> · {displayUrl(item.link)}</span> : null}
                    </div>
                    {item.tech ? <div className="mod-project-tech">{item.tech}</div> : null}
                  </div>
                </div>
                <Bullets items={item.bullets} />
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="mod-section">
            <h2 className="mod-sec-title">Education</h2>
            {education.map((item) => (
              <div className="mod-edu" key={item.id}>
                <div className="rd-entry-top">
                  <div>
                    <div className="rd-role">{item.degree || 'Degree'}</div>
                    <div className="rd-org">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <Range item={item} />
                </div>
                {item.grade ? <div className="mod-detail">{item.grade}</div> : null}
                {item.details ? <div className="mod-detail">{item.details}</div> : null}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compact — dense ATS-first                                           */
/* ------------------------------------------------------------------ */

function CompactTemplate({ resume, placeholder }) {
  const p = resume.personal || {};
  const contacts = contactItems(p);
  const summary = (p.summary || '').trim();
  const experience = (resume.experience || []).filter(hasExperience);
  const education = (resume.education || []).filter(hasEducation);
  const projects = (resume.projects || []).filter(hasProject);
  const certifications = (resume.certifications || []).filter(hasCert);
  const languages = (resume.languages || []).filter((l) => l.name);
  const skills = (resume.skills || []).filter(Boolean);

  return (
    <div className="resume-doc tpl-compact" style={{ '--accent': accentOf(resume) }}>
      <header className="cmp-head">
        <div>
          <div className="cmp-name">
            {p.fullName?.trim() || (placeholder ? 'Your Name' : ' ')}
          </div>
          {p.title?.trim() ? <div className="cmp-role">{p.title}</div> : null}
        </div>
        {contacts.length > 0 && (
          <div className="cmp-contact">
            {contacts.map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </div>
        )}
      </header>

      {(summary || placeholder) && (
        <section className="cmp-section">
          <div className="cmp-title">Summary</div>
          <p className={cn('cmp-summary', !summary && 'ph')}>
            {summary ||
              'Two lines connecting your experience to this role, with the impact you are known for.'}
          </p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="cmp-section">
          <div className="cmp-title">Experience</div>
          {experience.map((item) => (
            <div className="cmp-entry" key={item.id}>
              <aside className="cmp-side">
                <strong>{formatRange(item.startDate, item.endDate, item.current) || 'Dates'}</strong>
                {item.location ? <span>{item.location}</span> : null}
              </aside>
              <div>
                <div className="rd-role">{item.role || 'Role'}</div>
                <div className="rd-org">{item.company}</div>
                <Bullets items={item.bullets} />
              </div>
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className="cmp-section">
          <div className="cmp-title">Education</div>
          {education.map((item) => (
            <div className="cmp-edu" key={item.id}>
              <aside className="cmp-side">
                <strong>{formatRange(item.startDate, item.endDate, false) || 'Dates'}</strong>
              </aside>
              <div>
                <div className="rd-role">{item.degree || 'Degree'}</div>
                <div className="rd-org">
                  {[item.school, item.location].filter(Boolean).join(' · ')}
                </div>
                {item.grade ? <div className="cmp-side" style={{ paddingTop: 2 }}>{item.grade}</div> : null}
                {item.details ? <div className="cmp-side" style={{ paddingTop: 2 }}>{item.details}</div> : null}
              </div>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="cmp-section">
          <div className="cmp-title">Skills</div>
          <p className="cmp-skills">
            {skills.map((skill, index) => (
              <span key={`${skill}-${index}`}>{skill}</span>
            ))}
          </p>
        </section>
      )}

      {projects.length > 0 && (
        <section className="cmp-section">
          <div className="cmp-title">Projects</div>
          {projects.map((item) => (
            <div className="cmp-entry" key={item.id}>
              <aside className="cmp-side">
                <strong>{item.tech || 'Project'}</strong>
                {item.link ? <span>{displayUrl(item.link)}</span> : null}
              </aside>
              <div>
                <div className="rd-role">{item.name || 'Project'}</div>
                <Bullets items={item.bullets} />
              </div>
            </div>
          ))}
        </section>
      )}

      {(certifications.length > 0 || languages.length > 0) && (
        <div className="cmp-two-col">
          {certifications.length > 0 && (
            <section className="cmp-section">
              <div className="cmp-title">Certifications</div>
              {certifications.map((item) => (
                <div className="cmp-cert" key={item.id}>
                  <span>
                    {item.name}
                    {item.issuer ? ` — ${item.issuer}` : ''}
                  </span>
                  <span>{item.date}</span>
                </div>
              ))}
            </section>
          )}
          {languages.length > 0 && (
            <section className="cmp-section">
              <div className="cmp-title">Languages</div>
              {languages.map((lang) => (
                <div className="cmp-cert" key={lang.id}>
                  <span>{lang.name}</span>
                  <span>{lang.level}</span>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResumeDocument({ resume, placeholder = true, template }) {
  if (!resume) return null;
  const selected = template || resume.template || 'minimal';
  if (selected === 'modern') return <ModernTemplate resume={resume} placeholder={placeholder} />;
  if (selected === 'compact') return <CompactTemplate resume={resume} placeholder={placeholder} />;
  return <MinimalTemplate resume={resume} placeholder={placeholder} />;
}
