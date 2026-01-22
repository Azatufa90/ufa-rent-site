'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Navbar() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
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
          <Link className="link" href="/">Каталог</Link>
          <Link className="link" href="/fresh">Свежие</Link>
          <Link className="link" href="/dashboard">Кабинет</Link>
          <Link className="link" href="/admin">Админка</Link>

          <a className="icon-link" href="tel:+789613719141" aria-label="Позвонить">
            <span className="icon-circle">📞</span>
            <span>89613719141</span>
          </a>

          <a className="icon-link tg" href="https://t.me/kvartirkaufa02" target="_blank" rel="noreferrer" aria-label="Telegram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.6 4.7L3.7 11.7c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.7 5.1c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.1c.3-1.3-.5-1.9-1.3-1.6Z" fill="currentColor"/>
            </svg>
            <span>Telegram</span>
          </a>

          <span className="icon-link max" aria-label="MAX">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="6" fill="currentColor" opacity="0.25"/>
              <path d="M7.2 16V8.4h1.5l3.3 4.2 3.3-4.2h1.5V16h-1.7v-5.1l-3.1 3.9h-.4l-3.1-3.9V16H7.2Zm10.2 0-2.6-3.8L17.4 8.4h2l-3.4 5 3.4 2.6h-2Z" fill="currentColor"/>
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
