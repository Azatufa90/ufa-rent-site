'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase/client';


export default function FreshWidget() {
  const supabase = supabaseBrowser();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('listings_public')
        .select('id,title,price_rub,district,property_type,created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5);

      if (alive) setItems(data ?? []);
    })();

    return () => { alive = false; };
  }, [supabase]);

  if (!items.length) return null;

  return (
    <aside className="fresh">
      <div className="fresh-head">
        <div className="fresh-title">Свежие объекты</div>
        <Link className="fresh-all" href="/fresh">Все</Link>
      </div>

      <div className="fresh-list">
        {items.map((x) => (
          <Link key={x.id} className="fresh-item" href={`/listing/${x.id}`}>
            <div className="fresh-item-title">{x.title}</div>
            <div className="fresh-item-sub">
              {x.district} • {x.property_type} • {Number(x.price_rub).toLocaleString('ru-RU')} ₽
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
