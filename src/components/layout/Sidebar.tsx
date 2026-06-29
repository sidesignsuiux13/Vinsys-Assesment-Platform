import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { NAV_BY_ROLE } from './navConfig';

export function Sidebar() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logoDataUrl = useSettingsStore((s) => s.logoDataUrl);

  if (!currentUser) return null;
  const items = NAV_BY_ROLE[currentUser.role];

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-neutral-200 flex flex-col h-full">
      <div className="px-5 h-14 flex flex-col justify-center border-b border-neutral-200">
        {logoDataUrl ? (
          <img src={logoDataUrl} alt="Portal logo" className="h-8 w-fit max-w-36 object-contain" />
        ) : (
          <>
            <span className="text-lg font-bold tracking-tight text-maroon-600 leading-none">VINSYS</span>
            <span className="text-[11px] text-neutral-400 leading-tight">Assessment Portal</span>
          </>
        )}
      </div>

      <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-maroon-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
