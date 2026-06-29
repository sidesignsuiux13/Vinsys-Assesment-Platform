import { create } from 'zustand';
import { ATTEMPT_STORAGE_KEY, MAX_VIOLATIONS, uuid } from '@/lib/constants';

interface PersistedAttempt {
  attemptId: string | null;
  startTime: number | null;
  answers: Record<string, any>;
  markedForReview: string[];
  isSubmitted: boolean;
  violationCount: number;
}

interface AssessmentState extends PersistedAttempt {
  startAttempt: () => void;
  saveAnswer: (questionId: string, value: any) => void;
  toggleReview: (questionId: string) => void;
  submitAttempt: () => void;
  incrementViolation: () => number;
  resetAttempt: () => void;
  rehydrate: () => void;
}

function persist(state: PersistedAttempt) {
  localStorage.setItem(
    ATTEMPT_STORAGE_KEY,
    JSON.stringify({
      attemptId: state.attemptId,
      startTime: state.startTime,
      answers: state.answers,
      markedForReview: state.markedForReview,
      isSubmitted: state.isSubmitted,
      violationCount: state.violationCount,
    })
  );
}

const initial: PersistedAttempt = {
  attemptId: null,
  startTime: null,
  answers: {},
  markedForReview: [],
  isSubmitted: false,
  violationCount: 0,
};

// Hydrate synchronously so a refresh mid-attempt keeps the session alive.
function readPersistedAttempt(): PersistedAttempt {
  try {
    const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as PersistedAttempt;
    return {
      attemptId: parsed.attemptId ?? null,
      startTime: parsed.startTime ?? null,
      answers: parsed.answers ?? {},
      markedForReview: parsed.markedForReview ?? [],
      isSubmitted: parsed.isSubmitted ?? false,
      violationCount: parsed.violationCount ?? 0,
    };
  } catch {
    return initial;
  }
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  ...readPersistedAttempt(),

  startAttempt: () => {
    const next: PersistedAttempt = {
      attemptId: uuid(),
      startTime: Date.now(),
      answers: {},
      markedForReview: [],
      isSubmitted: false,
      violationCount: 0,
    };
    set(next);
    persist(next);
  },

  saveAnswer: (questionId, value) => {
    set((s) => {
      const answers = { ...s.answers, [questionId]: value };
      const next = { ...s, answers };
      persist(next);
      return { answers };
    });
  },

  toggleReview: (questionId) => {
    set((s) => {
      const exists = s.markedForReview.includes(questionId);
      const markedForReview = exists
        ? s.markedForReview.filter((id) => id !== questionId)
        : [...s.markedForReview, questionId];
      const next = { ...s, markedForReview };
      persist(next);
      return { markedForReview };
    });
  },

  submitAttempt: () => {
    set((s) => {
      const next = { ...s, isSubmitted: true };
      // Clear the active-attempt key once submitted.
      localStorage.removeItem(ATTEMPT_STORAGE_KEY);
      return { isSubmitted: true };
    });
  },

  incrementViolation: () => {
    const count = get().violationCount + 1;
    set((s) => {
      const next = { ...s, violationCount: count };
      persist(next);
      return { violationCount: count };
    });
    if (count > MAX_VIOLATIONS) {
      get().submitAttempt();
    }
    return count;
  },

  resetAttempt: () => {
    set(initial);
    localStorage.removeItem(ATTEMPT_STORAGE_KEY);
  },

  rehydrate: () => {
    try {
      const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedAttempt;
      set({
        attemptId: parsed.attemptId ?? null,
        startTime: parsed.startTime ?? null,
        answers: parsed.answers ?? {},
        markedForReview: parsed.markedForReview ?? [],
        isSubmitted: parsed.isSubmitted ?? false,
        violationCount: parsed.violationCount ?? 0,
      });
    } catch {
      // ignore malformed storage
    }
  },
}));
