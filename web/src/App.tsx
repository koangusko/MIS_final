import { useEffect, useState } from 'react';

export default function App() {
  const [health, setHealth] = useState('checking…');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealth(d.status ?? 'unknown'))
      .catch(() => setHealth('offline'));
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 text-slate-900">
      <h1 className="text-2xl font-bold">時間公約 ScreenPact</h1>
      <p className="text-slate-500">Phase 0 骨架運作中</p>
      <span className="rounded-full bg-slate-200 px-3 py-1 text-sm">API: {health}</span>
    </main>
  );
}
