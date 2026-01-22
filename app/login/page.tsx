'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, role: 'user' }, { onConflict: 'id' });
    }

    router.push(next);
    router.refresh();
    setLoading(false);
  }

  async function signUp() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, role: 'user' }, { onConflict: 'id' });
    }

    setLoading(false);
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '48px auto' }}>
      <h1 className="h1">Вход / Регистрация</h1>
      <div className="stack">
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err ? <p className="error">{err}</p> : null}
        <div className="row">
          <button className="btn" onClick={signIn} disabled={loading}>Войти</button>
          <button className="btn secondary" onClick={signUp} disabled={loading}>Регистрация</button>
        </div>
      </div>
    </div>
  );
}
