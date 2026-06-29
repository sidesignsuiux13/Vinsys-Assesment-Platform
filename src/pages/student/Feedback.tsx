import { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { COURSE } from '@/mock/courses';
import { feedbackKey } from '@/lib/constants';

export default function StudentFeedback() {
  const user = useAuthStore((s) => s.currentUser)!;
  const [submitted, setSubmitted] = useState(() => !!localStorage.getItem(feedbackKey(user.id)));
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [enjoyed, setEnjoyed] = useState('');
  const [improve, setImprove] = useState('');
  const [other, setOther] = useState('');

  const submit = () => {
    localStorage.setItem(
      feedbackKey(user.id),
      JSON.stringify({ rating, enjoyed, improve, other, at: Date.now() })
    );
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-800">Thank you for your feedback!</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Your responses for {COURSE.title} help us improve the training experience for everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-800">Feedbacks</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Submit feedback against your enrolled course.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Course selected for feedback</p>
        <h2 className="mt-1 text-base font-semibold text-neutral-800">{COURSE.title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{COURSE.duration_hours} hours · {COURSE.modules.length} modules</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">How would you rate this training program?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    (hover || rating) >= n ? 'fill-maroon-600 text-maroon-600' : 'text-neutral-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea label="What did you enjoy most?" rows={3} value={enjoyed} onChange={(e) => setEnjoyed(e.target.value)} />
        <Textarea label="What could be improved?" rows={3} value={improve} onChange={(e) => setImprove(e.target.value)} />
        <Textarea label="Any other comments?" rows={3} value={other} onChange={(e) => setOther(e.target.value)} />

        <Button onClick={submit} disabled={rating === 0}>
          Submit Feedback
        </Button>
      </div>
    </div>
  );
}
