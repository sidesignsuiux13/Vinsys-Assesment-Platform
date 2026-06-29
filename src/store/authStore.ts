import { create } from 'zustand';
import type { Role, User } from '@/types';
import { USERS, findUserByEmail, setCurrentUser } from '@/mock/users';
import { AUTH_STORAGE_KEY } from '@/lib/constants';

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'not_found' | 'role_mismatch' };

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, expectedRole?: Role) => LoginResult;
  logout: () => void;
  rehydrate: () => void;
  updateProfile: (details: Pick<User, 'full_name' | 'email'>) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const PROFILE_STORAGE_KEY = 'vinsys_profile_overrides';

function readProfileOverrides(): Record<string, Partial<User>> {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeProfileOverride(user: User) {
  const overrides = readProfileOverrides();
  overrides[user.id] = {
    full_name: user.full_name,
    email: user.email,
    password: user.password,
  };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(overrides));
}

function applyProfileOverrides(user: User): User {
  const override = readProfileOverrides()[user.id];
  if (!override) return user;
  Object.assign(user, override);
  return user;
}

// Hydrate synchronously at store creation so guards see the session on first render
// (a useEffect-based rehydrate runs too late and bounces hard refreshes to /login).
function readPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const { id } = JSON.parse(raw);
    const user = USERS.find((u) => u.id === id);
    return user ? applyProfileOverrides(user) : null;
  } catch {
    return null;
  }
}

const persistedUser = readPersistedUser();
if (persistedUser) setCurrentUser(persistedUser);

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: persistedUser,
  isAuthenticated: !!persistedUser,

  login: (email, password, expectedRole) => {
    USERS.forEach(applyProfileOverrides);
    const user = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      // Distinguish a pure role mismatch (valid creds, wrong role) for a clearer message.
      const byEmail = findUserByEmail(email);
      if (byEmail && byEmail.password === password && expectedRole && byEmail.role !== expectedRole) {
        return { ok: false, reason: 'role_mismatch' };
      }
      return { ok: false, reason: 'not_found' };
    }
    if (expectedRole && user.role !== expectedRole) {
      return { ok: false, reason: 'role_mismatch' };
    }
    setCurrentUser(user);
    set({ currentUser: user, isAuthenticated: true });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id: user.id }));
    return { ok: true, user };
  },

  logout: () => {
    setCurrentUser(null);
    set({ currentUser: null, isAuthenticated: false });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  rehydrate: () => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const { id } = JSON.parse(raw);
      const user = USERS.find((u) => u.id === id);
      if (user) {
        const hydratedUser = applyProfileOverrides(user);
        setCurrentUser(hydratedUser);
        set({ currentUser: hydratedUser, isAuthenticated: true });
      }
    } catch {
      // ignore malformed storage
    }
  },

  updateProfile: (details) => {
    set((state) => {
      if (!state.currentUser) return state;
      const nextUser = { ...state.currentUser, ...details };
      const sourceUser = USERS.find((user) => user.id === nextUser.id);
      if (sourceUser) Object.assign(sourceUser, nextUser);
      setCurrentUser(nextUser);
      writeProfileOverride(nextUser);
      return { currentUser: nextUser, isAuthenticated: true };
    });
  },

  changePassword: (currentPassword, newPassword) => {
    const user = useAuthStore.getState().currentUser;
    if (!user || user.password !== currentPassword) return false;
    const nextUser = { ...user, password: newPassword };
    const sourceUser = USERS.find((item) => item.id === nextUser.id);
    if (sourceUser) Object.assign(sourceUser, nextUser);
    setCurrentUser(nextUser);
    writeProfileOverride(nextUser);
    set({ currentUser: nextUser, isAuthenticated: true });
    return true;
  },
}));
