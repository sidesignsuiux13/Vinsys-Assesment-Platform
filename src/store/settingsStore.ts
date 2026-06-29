import { create } from 'zustand';

export type ResultVisibility = 'yes' | 'no';
export type ResultDetailLevel = 'summary' | 'details';
export type ProfileRequired = 'yes' | 'no';
export type PaletteKey = 'maroon' | 'indigo' | 'emerald' | 'slate';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export interface SystemSettings {
  emailTemplates: EmailTemplate[];
  showResultToCandidate: ResultVisibility;
  resultDetailLevel: ResultDetailLevel;
  userProfileRequired: ProfileRequired;
  logoDataUrl: string;
  palette: PaletteKey;
}

interface SettingsState extends SystemSettings {
  updateTemplate: (template: EmailTemplate) => void;
  updateResultSettings: (settings: Pick<SystemSettings, 'showResultToCandidate' | 'resultDetailLevel'>) => void;
  updateProfileRequired: (value: ProfileRequired) => void;
  updateBranding: (settings: Pick<SystemSettings, 'logoDataUrl' | 'palette'>) => void;
  rehydrate: () => void;
}

const STORAGE_KEY = 'vinsys_admin_settings';

const PALETTES: Record<PaletteKey, Record<string, string>> = {
  maroon: {
    '50': '#F9F0F0',
    '100': '#F0D9D9',
    '200': '#DFB0B0',
    '300': '#C97C7C',
    '400': '#AE4848',
    '500': '#8F2020',
    '600': '#7B1C1C',
    '700': '#621616',
    '800': '#4A1010',
    '900': '#310A0A',
  },
  indigo: {
    '50': '#EEF2FF',
    '100': '#E0E7FF',
    '200': '#C7D2FE',
    '300': '#A5B4FC',
    '400': '#818CF8',
    '500': '#6366F1',
    '600': '#4F46E5',
    '700': '#4338CA',
    '800': '#3730A3',
    '900': '#312E81',
  },
  emerald: {
    '50': '#ECFDF5',
    '100': '#D1FAE5',
    '200': '#A7F3D0',
    '300': '#6EE7B7',
    '400': '#34D399',
    '500': '#10B981',
    '600': '#059669',
    '700': '#047857',
    '800': '#065F46',
    '900': '#064E3B',
  },
  slate: {
    '50': '#F8FAFC',
    '100': '#F1F5F9',
    '200': '#E2E8F0',
    '300': '#CBD5E1',
    '400': '#94A3B8',
    '500': '#64748B',
    '600': '#475569',
    '700': '#334155',
    '800': '#1E293B',
    '900': '#0F172A',
  },
};

const defaultSettings: SystemSettings = {
  emailTemplates: [
    {
      id: 'exam-invite',
      name: 'Exam Invitation',
      subject: 'You are invited to {{exam_name}}',
      body: 'Hello {{candidate_name}},\n\nYou have been invited to take {{exam_name}} on {{exam_date}} at {{exam_time}}.\n\nPlease log in to the assessment portal before the start time.\n\nRegards,\nVinsys Team',
      updatedAt: '2026-06-20',
    },
    {
      id: 'exam-reminder',
      name: 'Exam Reminder',
      subject: 'Reminder: {{exam_name}} starts soon',
      body: 'Hello {{candidate_name}},\n\nThis is a reminder that {{exam_name}} starts at {{exam_time}}.\n\nKeep your ID proof ready and ensure your device is charged.\n\nRegards,\nVinsys Team',
      updatedAt: '2026-06-22',
    },
    {
      id: 'result-published',
      name: 'Result Published',
      subject: 'Your result for {{exam_name}} is available',
      body: 'Hello {{candidate_name}},\n\nYour result for {{exam_name}} has been published. Log in to the portal to view your result.\n\nRegards,\nVinsys Team',
      updatedAt: '2026-06-24',
    },
  ],
  showResultToCandidate: 'yes',
  resultDetailLevel: 'summary',
  userProfileRequired: 'yes',
  logoDataUrl: '',
  palette: 'maroon',
};

function applyPalette(palette: PaletteKey) {
  if (typeof document === 'undefined') return;
  const colors = PALETTES[palette];
  Object.entries(colors).forEach(([shade, value]) => {
    document.documentElement.style.setProperty(`--brand-${shade}`, value);
  });
}

function readSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

function persist(settings: SystemSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  applyPalette(settings.palette);
}

const initialSettings = readSettings();
applyPalette(initialSettings.palette);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initialSettings,

  updateTemplate: (template) => {
    const next = {
      ...get(),
      emailTemplates: get().emailTemplates.map((item) => (item.id === template.id ? template : item)),
    };
    persist(next);
    set(next);
  },

  updateResultSettings: (settings) => {
    const next = { ...get(), ...settings };
    persist(next);
    set(next);
  },

  updateProfileRequired: (value) => {
    const next = { ...get(), userProfileRequired: value };
    persist(next);
    set(next);
  },

  updateBranding: (settings) => {
    const next = { ...get(), ...settings };
    persist(next);
    set(next);
  },

  rehydrate: () => {
    const next = readSettings();
    applyPalette(next.palette);
    set(next);
  },
}));
