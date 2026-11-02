import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiError } from '../lib/api';

export default function Login() {
  const { login, startDemo } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Log in — Vitae';
  }, []);

  const from = location.state?.from || '/dashboard';

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    if (error) setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      toast('Welcome back. Your workspace is ready.');
      navigate(from, { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const runDemo = async () => {
    setDemoBusy(true);
    setError('');
    try {
      await startDemo();
      toast('Demo workspace ready. Explore freely.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiError(err));
      setDemoBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-moss">Welcome back</p>
        <h1 className="mt-2 font-display text-[40px] leading-none tracking-[-0.01em] text-ink">
          Pick up where you left off.
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-soft">
          Sign in to keep editing, export a fresh PDF, or share your latest version.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12.5px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              autoFocus
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="At least 8 characters"
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

          <Button type="submit" size="lg" className="w-full" loading={busy}>
            Sign in
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.16em] text-faint">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={runDemo}
          loading={demoBusy}
        >
          <Sparkles className="h-4 w-4 text-moss" />
          Explore the demo workspace
        </Button>

        <p className="mt-8 text-center text-[13px] text-soft">
          New to Vitae?{' '}
          <Link to="/register" className="font-medium text-forest underline decoration-lime decoration-2 underline-offset-4 hover:text-forest-deep">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
