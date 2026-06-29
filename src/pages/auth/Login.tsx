import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { ROLE_HOME, ROLE_LABELS } from '@/lib/constants';
import { DEMO_CREDENTIALS as CREDS } from '@/mock/users';
import type { Role } from '@/types';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const logoDataUrl = useSettingsStore((s) => s.logoDataUrl);
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email.trim(), password, role);
    if (result.ok) {
      navigate(ROLE_HOME[result.user.role]);
    } else if (result.reason === 'role_mismatch') {
      setError('Role does not match this account.');
    } else {
      setError('Invalid email or password.');
    }
  };

  const fill = (c: { email: string; password: string; role: string }) => {
    setEmail(c.email);
    setPassword(c.password);
    setRole(c.role.toLowerCase() as Role);
    setError('');
  };

  return (
    <div className="h-screen overflow-hidden bg-neutral-50">
      <div className="grid h-full lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-neutral-900 px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide">VINSYS</p>
                <p className="text-xs text-white/55">Assessment Portal</p>
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/75">
              <Sparkles className="h-3.5 w-3.5" />
              Secure training and exam management
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal">
              Manage assessments, exams, results, and candidates from one focused workspace.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/65">
              A streamlined portal for admins, trainers, HR teams, and candidates to move through learning and evaluation with clarity.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Roles', value: '4' },
              { label: 'Exam tools', value: '12+' },
              { label: 'Live demo', value: 'Ready' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs text-white/55">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <main className="flex min-h-0 items-center justify-center px-4 py-4 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-5">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="Portal logo" className="mb-3 h-11 w-fit max-w-44 object-contain" />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight text-maroon-600">VINSYS</h1>
              )}
              <p className="text-sm text-neutral-500">Assessment Portal</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-neutral-800">Welcome back</h2>
                <p className="mt-1 text-sm text-neutral-400">Choose your role and sign in to continue.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {(['student', 'trainer', 'hr', 'admin'] as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Demo Credentials</p>
                  <p className="mt-0.5 text-xs text-neutral-400">Click a role to autofill.</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-maroon-600" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CREDS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => fill(c)}
                    className="min-w-0 rounded-lg border border-neutral-100 px-2.5 py-2 text-left transition-colors hover:border-maroon-200 hover:bg-maroon-50"
                  >
                    <span className="inline-flex max-w-full rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                      {c.role}
                    </span>
                    <span className="mt-1.5 block min-w-0">
                      <span className="block truncate text-[11px] font-medium text-neutral-700">{c.email}</span>
                      <span className="block truncate text-[11px] font-mono text-neutral-400">{c.password}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
