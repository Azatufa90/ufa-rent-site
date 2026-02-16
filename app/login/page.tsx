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
  const [info, setInfo] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setErr(null);
    setInfo(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      await supabase.from('profiles').upsert(
        { id: user.id, role: 'user' },
        { onConflict: 'id' }
      );
    }

    router.push(next);
    router.refresh();
    setLoading(false);
  }

  async function signUp() {
    setLoading(true);
    setErr(null);
    setInfo(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setInfo('Проверь почту: возможно нужно подтвердить email.');
    setLoading(false);
  }

  async function forgotPassword() {
    setLoading(true);
    setErr(null);
    setInfo(null);

    if (!email) {
      setErr('Сначала введи Email');
      setLoading(false);
      return;
    }

    // ВАЖНО: страница /update-password должна существовать
    const redirectTo = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setInfo('Ссылка для сброса пароля отправлена на почту.');
    setLoading(false);
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '48px auto' }}>
      <h1 className="h1">Вход</h1>

      <div className="stack">
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <p className="error">{err}</p>}
        {info && <p className="muted">{info}</p>}

        <div className="row">
          <button className="btn" onClick={signIn} disabled={loading}>
            Войти
          </button>

          <button className="btn secondary" onClick={signUp} disabled={loading} type="button">
            Регистрация
          </button>
        </div>

        <button
          className="btn secondary"
          type="button"
          onClick={forgotPassword}
          disabled={loading}
        >
          Забыли пароль?
        </button>
      </div>
    </div>
  );
}
