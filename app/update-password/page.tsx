'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function updatePassword() {
    setLoading(true);
    setErr(null);
    setOk(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setOk('Пароль успешно обновлён ✅');
    setLoading(false);

    setTimeout(() => {
      router.push('/login');
      router.refresh();
    }, 1200);
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '48px auto' }}>
      <h1 className="h1">Смена пароля</h1>

      <div className="stack">
        <input
          className="input"
          placeholder="Новый пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err ? <p className="error">{err}</p> : null}
        {ok ? <p className="muted">{ok}</p> : null}

        <button className="btn" onClick={updatePassword} disabled={loading || !password}>
          Сохранить новый пароль
        </button>
      </div>
    </div>
  );
}
