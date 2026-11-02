import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Link2,
  Lock,
  Share2,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import { api, apiError } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function ShareModal({ open, onClose, resume, onUpdated, onBeforeChange }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isPublic = resume?.visibility === 'public' && Boolean(resume?.slug);
  const url = useMemo(
    () => (resume?.slug ? `${window.location.origin}/r/${resume.slug}` : ''),
    [resume?.slug]
  );

  useEffect(() => {
    if (open) {
      setError('');
      setBusy(false);
      setCopied(false);
    }
  }, [open]);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast('Public link copied.');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError('Could not copy automatically. Select the link and copy it manually.');
    }
  };

  const toggle = async () => {
    if (!resume) return;
    setBusy(true);
    setError('');
    try {
      await onBeforeChange?.();
      const action = isPublic ? 'unpublish' : 'publish';
      const { data } = await api.post(`/resumes/${resume.id}/${action}`);
      onUpdated?.(data.resume);
      if (action === 'publish') {
        const link = `${window.location.origin}/r/${data.resume.slug}`;
        await navigator.clipboard.writeText(link).catch(() => {});
        setCopied(true);
        toast('Resume published. Public link copied.');
      } else {
        toast('Resume is private again. The link is disabled.', 'info');
      }
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Share resume"
      description="Publish a read-only page with a clean, mobile-friendly layout."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10.5px] text-faint">
            {isPublic ? 'Live page updates as you edit.' : 'Only people with the link can view.'}
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={onClose} type="button">
              Done
            </Button>
            <Button onClick={toggle} loading={busy} type="button" variant={isPublic ? 'outline' : 'primary'}>
              {isPublic ? (
                <>
                  <Lock className="h-4 w-4" />
                  Make private
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Publish resume
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div
          className={cn(
            'flex flex-wrap items-center gap-3 rounded-2xl border p-4',
            isPublic ? 'border-lime/60 bg-lime-soft/50' : 'border-line bg-cream/35'
          )}
        >
          <span
            className={cn(
              'grid h-10 w-10 place-items-center rounded-xl',
              isPublic ? 'bg-forest text-lime' : 'bg-cream-deep text-soft'
            )}
          >
            {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink">
              {isPublic ? 'Published and live' : 'Private draft'}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-soft">
              {isPublic
                ? 'Anyone with the link can read this resume.'
                : 'Publishing creates a unique link. You can unpublish anytime.'}
            </p>
          </div>
          {isPublic ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-forest/70">
                <Eye className="h-3.5 w-3.5" />
                {resume?.views || 0} views
              </span>
              <Badge tone="forest">Public</Badge>
            </div>
          ) : (
            <Badge tone="neutral">Private</Badge>
          )}
        </div>

        {isPublic ? (
          <div>
            <div className="mb-2 text-[12px] font-medium text-ink/85">Public link</div>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-paper p-1.5 pl-3">
              <Link2 className="h-4 w-4 shrink-0 text-faint" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-soft">{url}</span>
              <Button variant="outline" size="sm" onClick={copy} type="button" className="shrink-0">
                {copied ? <Check className="h-3.5 w-3.5 text-moss" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-paper text-soft transition hover:border-ink/20 hover:text-ink"
                aria-label="Open public resume"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-cream/20 p-6 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-cream-deep text-forest">
              <Lock className="h-5 w-5" />
            </div>
            <p className="mt-3 text-[12.5px] font-medium text-ink">No public link yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-faint">
              Publishing is instant. The page hides private metrics and shows a “Made with Vitae”
              badge with a link back to your public profile.
            </p>
          </div>
        )}

        <div className="rounded-xl bg-cream/50 px-3.5 py-3 text-[10.5px] leading-relaxed text-faint">
          <strong className="font-semibold text-soft">Privacy:</strong> The public page shows only
          your resume content. Email, phone, and links are visible — remove anything you would not
          put on a printed copy. Unpublishing disables the URL immediately.
        </div>
      </div>
    </Modal>
  );
}
