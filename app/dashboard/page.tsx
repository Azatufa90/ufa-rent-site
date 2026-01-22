import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 className="h1">Мои объекты</h1>
          <p className="muted">Добавляй, редактируй и удаляй объявления.</p>
        </div>
        <Link className="btn" href="/dashboard/new">+ Добавить объект</Link>
      </div>

      {error ? <p className="error">Ошибка: {error.message}</p> : null}

      <div className="grid">
        {(data ?? []).map((x: any) => (
          <div key={x.id} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="title">{x.title}</div>
                <div className="muted">{x.district} • {x.property_type}</div>
                <div className="muted">{x.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price">{Number(x.price_rub).toLocaleString('ru-RU')} ₽/мес</div>
                <div className="pill">{x.status}</div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
              <Link className="btn secondary" href={`/dashboard/${x.id}/edit`}>Редактировать</Link>

              <form action={`/api/listings?id=${x.id}`} method="post">
                <input type="hidden" name="_method" value="DELETE" />
                <button className="btn danger" type="submit">Удалить</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
