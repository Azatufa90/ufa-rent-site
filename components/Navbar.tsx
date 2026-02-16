'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Navbar() {
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserAndAdmin() {
      // 1) user
      const { data } = await supabase.auth.getUser();
      const nextEmail = data.user?.email ?? null;

      if (cancelled) return;
      setEmail(nextEmail);

      // 2) admin (только если есть юзер)
      if (!nextEmail) {
        setIsAdmin(false);
        setAdminChecked(true);
        return;
      }

      try {
        const res = await fetch('/api/is-admin', { cache: 'no-store' });
        const json = await res.json().catch(() => null);

        if (cancelled) return;
        setIsAdmin(!!json?.isAdmin);
        setAdminChecked(true);
      } catch {
        if (cancelled) return;
        setIsAdmin(false);
        setAdminChecked(true);
      }
    }

    loadUserAndAdmin();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      const nextEmail = s?.user?.email ?? null;
      setEmail(nextEmail);

      // при смене сессии заново проверяем админа
      setAdminChecked(false);

      if (!nextEmail) {
        setIsAdmin(false);
        setAdminChecked(true);
        return;
      }

      try {
        const res = await fetch('/api/is-admin', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        setIsAdmin(!!json?.isAdmin);
        setAdminChecked(true);
      } catch {
        setIsAdmin(false);
        setAdminChecked(true);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    location.href = '/';
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">Аренда квартир в городе Уфа</Link>

        <nav className="row" style={{ flexWrap: 'wrap' }}>
          <Link className="link" href="/catalog">Каталог</Link>
          <Link className="link" href="/fresh">Свежие</Link>
          <Link className="link" href="/dashboard">Кабинет</Link>

          {/* Админка показывается только админам */}
          {email && adminChecked && isAdmin && (
            <Link className="link" href="/admin">Админка</Link>
          )}

          <a className="icon-link" href="tel:+789613719141" aria-label="Позвонить">
            <span className="icon-circle">📞</span>
            <span>89613719141</span>
          </a>

          <a
            className="icon-link tg"
            href="https://t.me/kvartirkaufa02"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21.6 4.7L3.7 11.7c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.7 5.1c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.1c.3-1.3-.5-1.9-1.3-1.6Z"
                fill="currentColor"
              />
            </svg>
            <span>Telegram</span>
          </a>

          <span className="icon-link max" aria-label="MAX">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="6" fill="currentColor" opacity="0.25" />
              <path
                d="M7.2 16V8.4h1.5l3.3 4.2 3.3-4.2h1.5V16h-1.7v-5.1l-3.1 3.9h-.4l-3.1-3.9V16H7.2Zm10.2 0-2.6-3.8L17.4 8.4h2l-3.4 5 3.4 2.6h-2Z"
                fill="currentColor"
              />
            </svg>
            <span>MAX</span>
          </span>

          {!email ? (
            <Link className="btn small" href="/login">Войти</Link>
          ) : (
            <button className="btn small secondary" onClick={signOut}>Выйти</button>
          )}
        </nav>
      </div>
    </header>
  );
}
