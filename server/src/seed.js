import bcrypt from 'bcryptjs';
import { closeDB, connectDB } from './config/db.js';
import { Resume } from './models/Resume.js';
import { User } from './models/User.js';
import { makeSlug } from './utils/normalize.js';
import { sampleResume } from './utils/resumeData.js';

async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash('demopass123', 10);
  const user = await User.findOneAndUpdate(
    { email: 'demo@vitae.app' },
    {
      name: 'Jordan Ellis',
      email: 'demo@vitae.app',
      passwordHash,
      headline: 'Senior Product Engineer',
      isDemo: false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const sample = sampleResume();
  const publishedSlug = 'jordan-ellis-demo';
  const existing = await Resume.findOne({ user: user._id, title: sample.title });
  if (!existing) {
    await Resume.create({
      user: user._id,
      ...sample,
      visibility: 'public',
      slug: publishedSlug,
      views: 12,
      ats: { score: 86, checkedAt: new Date() },
    });
  }

  const empty = {
    ...sample,
    title: 'Frontend Engineer — Draft',
    template: 'minimal',
    visibility: 'private',
    slug: undefined,
  };
  if (!(await Resume.findOne({ user: user._id, title: empty.title }))) {
    await Resume.create({ user: user._id, ...empty });
  }

  console.log('Seeded demo account:');
  console.log('  email    : demo@vitae.app');
  console.log('  password : demopass123');
  console.log(`  public   : /r/${publishedSlug}`);
  console.log(`  slug func : ${makeSlug('Jordan Ellis')}`);
  await closeDB();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
