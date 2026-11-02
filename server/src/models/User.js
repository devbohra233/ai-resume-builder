import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: '' },
    headline: { type: String, default: '', maxlength: 120 },
    isDemo: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.toSafe = function toSafe() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    headline: this.headline,
    isDemo: this.isDemo,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
