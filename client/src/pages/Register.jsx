import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiError } from '../lib/api';

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Create account — Vitae';
  }, []);

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    if (error) setError('');
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Tell us what to call you.';
    if (!emailRe.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setError('');
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast('Account created. Your first resume is ready.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-moss">Create your account</p>
        <h1 className="mt-2 font-display text-[40px] leading-none tracking-[-0.01em] text-ink">
          Start with a strong page.
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-soft">
          Free to build. We’ll set up a starter resume so you are never staring at a blank screen.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12.5px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <Field label="Full name" htmlFor="name" error={fieldErrors.name}>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Jordan Ellis"
              value={form.name}
              onChange={update('name')}
              autoFocus
            />
          </Field>

          <Field label="Email" htmlFor="email" error={fieldErrors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            error={fieldErrors.password}
            hint={form.password ? undefined : 'At least 8 characters.'}
          >
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={update('password')}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-faint transition hover:bg-cream hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pb-1 text-[11px] text-faint">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3 w-3 text-moss" /> Starter resume included
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3 w-3 text-moss" /> Export anytime
            </span>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={busy}>
            Create free account
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
          By creating an account you agree to use Vitae responsibly. Your resume data stays in
          your workspace.
        </p>

        <p className="mt-6 text-center text-[13px] text-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-forest underline decoration-lime decoration-2 underline-offset-4 hover:text-forest-deep">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
