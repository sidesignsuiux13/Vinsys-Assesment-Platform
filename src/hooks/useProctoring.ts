import { RefObject, useEffect, useRef } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { toast } from '@/components/ui/Toast';
import { MAX_VIOLATIONS } from '@/lib/constants';

interface UseProctoringOptions {
  videoRef: RefObject<HTMLVideoElement>;
  enabled: boolean;
  onAutoSubmit: () => void;
}

interface UseProctoringResult {
  cameraGranted: boolean;
}

// Tab-switch detection + webcam stream for the assessment session.
export function useProctoring({ videoRef, enabled, onAutoSubmit }: UseProctoringOptions): {
  cameraGrantedRef: RefObject<boolean>;
} {
  const incrementViolation = useAssessmentStore((s) => s.incrementViolation);
  const cameraGrantedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    // Webcam
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        cameraGrantedRef.current = true;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        cameraGrantedRef.current = false;
      });

    // Tab switch detection
    const handleVisibility = () => {
      if (document.hidden && !submittedRef.current) {
        const count = incrementViolation();
        if (count > MAX_VIOLATIONS) {
          submittedRef.current = true;
          toast.error('Maximum violations exceeded. Submitting your assessment.');
          onAutoSubmit();
        } else {
          toast.warning(`Tab switch detected (#${count}). Max ${MAX_VIOLATIONS} allowed.`);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { cameraGrantedRef };
}
