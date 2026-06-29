import { useEffect, useRef, useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { TITLE_BY_PATH } from './navConfig';

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function TopNav() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Resolve the longest matching title prefix (handles nested routes).
  const title =
    TITLE_BY_PATH[location.pathname] ??
    Object.entries(TITLE_BY_PATH)
      .filter(([path]) => location.pathname.startsWith(path))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    'Portal';

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 shrink-0 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-neutral-800">{title}</h1>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon-600 text-white text-xs font-semibold">
            {initials(currentUser.full_name)}
          </div>
          <span className="text-sm text-neutral-700 hidden sm:block">{currentUser.full_name}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-11 z-40 w-48 rounded-xl border border-neutral-200 bg-white py-2 shadow-sm">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/profile');
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <UserRound className="h-4 w-4 text-neutral-500" />
              View Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <LogOut className="h-4 w-4 text-neutral-500" />
              Logout
            </button>
          </div>
        )}
        </div>
    </header>
  );
}
