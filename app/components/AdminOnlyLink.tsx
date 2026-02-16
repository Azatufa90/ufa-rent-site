'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function AdminOnlyLink({
  href = '/admin',
  className = 'btn',
  children = 'В админку',
}: {
  href?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const supabase = supabaseBrowser();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (!cancelled) setShow(false);
        return;
      }

      try {
        const res = await fetch('/api/is-admin', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        if (!cancelled) setShow(!!json?.isAdmin);
      } catch {
        if (!cancelled) setShow(false);
      }
    }

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!show) return null;

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
