import { useEffect, useRef, useState } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { formatTime } from '@/lib/constants';

interface UseTimerResult {
  remainingSeconds: number;
  formattedTime: string;
  isExpired: boolean;
}

// Derives remaining time from the store's startTime so a page refresh resumes correctly.
export function useTimer(durationSeconds: number, onExpire: () => void): UseTimerResult {
  const startTime = useAssessmentStore((s) => s.startTime);
  const isSubmitted = useAssessmentStore((s) => s.isSubmitted);
  const expiredRef = useRef(false);

  const compute = () => {
    if (!startTime) return durationSeconds;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  };

  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    if (isSubmitted) return;
    const id = setInterval(() => {
      const next = compute();
      setRemaining(next);
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(id);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, durationSeconds, isSubmitted]);

  return {
    remainingSeconds: remaining,
    formattedTime: formatTime(remaining),
    isExpired: remaining <= 0,
  };
}
