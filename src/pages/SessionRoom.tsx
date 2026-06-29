import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, CheckCircle2, Loader2, Mic, MonitorUp, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { COURSE } from '@/mock/courses';

type PermissionState = 'pending' | 'granted' | 'denied';

export default function SessionRoom() {
  const [params] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState<PermissionState>('pending');
  const [mic, setMic] = useState<PermissionState>('pending');
  const [joined, setJoined] = useState(false);
  const role = params.get('role') === 'trainer' ? 'Trainer' : 'Student';
  const module = params.get('module') ?? 'React Essentials';

  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        stream = mediaStream;
        setCamera('granted');
        setMic('granted');
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        setCamera('denied');
        setMic('denied');
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const canJoin = camera === 'granted' && mic === 'granted';

  return (
    <div className="min-h-screen bg-neutral-900 p-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45">{COURSE.title}</p>
            <h1 className="mt-1 text-xl font-semibold">{module} Live Session</h1>
          </div>
          <Badge variant={canJoin ? 'active' : 'draft'}>{role} room</Badge>
        </header>

        <main className="grid flex-1 gap-5 lg:grid-cols-[1fr_320px]">
          <section className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="h-full min-h-[420px] w-full object-cover" />
            {!canJoin && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/80">
                <div className="text-center">
                  {camera === 'pending' ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-white/65" /> : <Video className="mx-auto h-8 w-8 text-white/65" />}
                  <p className="mt-3 text-sm text-white/75">
                    Camera and microphone access are required before joining this session.
                  </p>
                </div>
              </div>
            )}
            {joined && (
              <div className="absolute left-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                Live
              </div>
            )}
          </section>

          <aside className="rounded-xl border border-white/10 bg-white p-5 text-neutral-800">
            <h2 className="text-sm font-semibold">Device readiness</h2>
            <div className="mt-4 space-y-3">
              <CheckItem icon={Camera} label="Camera" state={camera} />
              <CheckItem icon={Mic} label="Microphone" state={mic} />
              <CheckItem icon={MonitorUp} label="Screen ready" state="granted" />
            </div>

            <div className="mt-6 rounded-lg bg-neutral-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Session</p>
              <p className="mt-1 text-sm font-semibold text-neutral-800">{module}</p>
              <p className="mt-1 text-xs text-neutral-500">Role: {role}</p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button disabled={!canJoin} onClick={() => setJoined(true)}>
                <Video className="h-4 w-4" />
                {joined ? 'Joined Session' : 'Join Session'}
              </Button>
              <Button variant="ghost" onClick={() => window.close()}>
                <PhoneOff className="h-4 w-4" />
                Leave
              </Button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function CheckItem({ icon: Icon, label, state }: { icon: typeof Camera; label: string; state: PermissionState }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
      <span className="flex items-center gap-2 text-sm text-neutral-700">
        <Icon className="h-4 w-4 text-neutral-400" />
        {label}
      </span>
      {state === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
      {state === 'granted' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
      {state === 'denied' && <span className="text-xs font-medium text-red-600">Required</span>}
    </div>
  );
}
