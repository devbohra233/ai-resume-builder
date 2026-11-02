import mongoose from 'mongoose';

const sub = { _id: false };

const experienceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
  },
  sub
);

const educationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    degree: { type: String, default: '' },
    school: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    grade: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  sub
);

const projectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    link: { type: String, default: '' },
    tech: { type: String, default: '' },
    bullets: { type: [String], default: [] },
  },
  sub
);

const certificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    link: { type: String, default: '' },
  },
  sub
);

const languageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    level: { type: String, default: '' },
  },
  sub
);

const personalSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    summary: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
  },
  sub
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled resume', maxlength: 120 },
    template: { type: String, enum: ['minimal', 'modern', 'compact'], default: 'minimal' },
    accent: { type: String, default: '#1f6f5c' },
    personal: { type: personalSchema, default: () => ({}) },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    skills: { type: [String], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    languages: { type: [languageSchema], default: [] },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    slug: { type: String, unique: true, sparse: true, trim: true },
    views: { type: Number, default: 0 },
    ats: {
      score: { type: Number, default: null },
      checkedAt: { type: Date, default: null },
    },
    lastEditedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, minimize: false }
);

resumeSchema.index({ user: 1, updatedAt: -1 });
resumeSchema.index({ visibility: 1, slug: 1 });

resumeSchema.virtual('completeness').get(function completeness() {
  const checks = [
    Boolean(this.personal?.fullName),
    Boolean(this.personal?.title),
    Boolean(this.personal?.email),
    Boolean(this.personal?.summary && this.personal.summary.length > 60),
    this.experience?.length > 0,
    this.education?.length > 0,
    this.skills?.length >= 5,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
});

resumeSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

export const Resume = mongoose.model('Resume', resumeSchema);
