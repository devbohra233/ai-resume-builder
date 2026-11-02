import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from './ui/Badge';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import { cn, initials } from '../lib/utils';

export default function AppHeader({ onNewResume, className }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = () => {
    logout();
    toast('Signed out. See you soon.', 'info');
    navigate('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-line/80 bg-cream/85 backdrop-blur-md no-print',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/dashboard" className="shrink-0" aria-label="Vitae dashboard">
          <Logo />
        </Link>
        {user?.isDemo ? (
          <Badge tone="lime" className="ml-2 hidden sm:inline-flex">
            Demo session
          </Badge>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={onNewResume} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
            New resume
          </Button>
          <Button size="icon" onClick={onNewResume} className="sm:hidden" aria-label="New resume">
            <Plus className="h-4 w-4" />
          </Button>
          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-2 transition hover:border-line hover:bg-paper"
                aria-label="Account menu"
              >
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-forest text-[11px] font-semibold text-lime">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(user?.name)
                  )}
                </span>
                <span className="hidden max-w-[130px] truncate text-[13px] font-medium text-ink/80 md:block">
                  {user?.name}
                </span>
              </button>
            }
            items={[
              { type: 'label', label: user?.email || 'Signed in' },
              { type: 'separator' },
              {
                label: signingOut ? 'Signing out…' : 'Sign out',
                icon: LogOut,
                onClick: () => {
                  setSigningOut(true);
                  handleLogout();
                },
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
