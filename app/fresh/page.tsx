import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const revalidate = 60 * 60 * 24; // 24 часа

export default async function FreshPage() {
  const supabase = supabaseServer();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('listings_public')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 className="h1">Свежие объекты (за 24 часа)</h1>
          <p className="muted">Страница обновляется автоматически 1 раз в сутки.</p>
        </div>
        <Link className="btn secondary" href="/">← Назад</Link>
      </div>

      {error ? <p className="error">Ошибка: {error.message}</p> : null}

      <div className="grid">
        {(data ?? []).map((x: any) => (
          <article key={x.id} className="card">
            <div className="title">{x.title}</div>
            <div className="muted">{x.district} • {x.property_type} • {x.address}</div>
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
              <div className="price">{Number(x.price_rub).toLocaleString('ru-RU')} ₽/мес</div>
              <Link className="btn small" href={`/listing/${x.id}`}>Открыть</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
