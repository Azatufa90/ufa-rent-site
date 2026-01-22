import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

const DISTRICTS = ['','Кировский','Советский','Ленинский','Орджоникидзевский','Калининский','Дёмский'];
const TYPES = ['','Комната','Студия','1 Комнатная','2-Х комнатная','3-Х комнатная','4-5 комнатная'];
const STATUSES = ['','draft','active','archived'];

export default async function AdminPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="card">
        <h1 className="h1">Доступ запрещён</h1>
        <p className="muted">Эта страница только для администратора.</p>
        <Link className="btn secondary" href="/">← На главную</Link>
      </div>
    );
  }

  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const district = typeof searchParams.district === 'string' ? searchParams.district : '';
  const type = typeof searchParams.type === 'string' ? searchParams.type : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : '';

  let query = supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(200);
  if (district) query = query.eq('district', district);
  if (type) query = query.eq('property_type', type);
  if (status) query = query.eq('status', status);
  if (q) {
    const s = `%${q}%`;
    query = query.or(`title.ilike.${s},address.ilike.${s},description.ilike.${s}`);
  }

  const { data, error } = await query;

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 className="h1">Админка</h1>
          <p className="muted">Модерация объявлений: draft / active / archived</p>
        </div>
        <Link className="btn secondary" href="/dashboard">Кабинет</Link>
      </div>

      <form className="card" style={{ marginTop: 14 }} action="/admin" method="get">
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <input className="input" style={{ flex: 2, minWidth: 220 }} name="q" defaultValue={q} placeholder="Поиск…" />
          <select className="input" style={{ flex: 1, minWidth: 180 }} name="district" defaultValue={district}>
            {DISTRICTS.map((d) => <option key={d || 'all'} value={d}>{d || 'Все районы'}</option>)}
          </select>
          <select className="input" style={{ flex: 1, minWidth: 180 }} name="type" defaultValue={type}>
            {TYPES.map((t) => <option key={t || 'all'} value={t}>{t || 'Все типы'}</option>)}
          </select>
          <select className="input" style={{ width: 160 }} name="status" defaultValue={status}>
            {STATUSES.map((s) => <option key={s || 'all'} value={s}>{s || 'Все статусы'}</option>)}
          </select>
          <button className="btn" type="submit">Фильтр</button>
        </div>
      </form>

      {error ? <p className="error">Ошибка: {error.message}</p> : null}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="section-title">Список (до 200)</div>
          <div className="pill">Админ</div>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {(data ?? []).map((x: any) => (
            <div key={x.id} className="card" style={{ padding: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div className="title">{x.title}</div>
                  <div className="muted">{x.district} • {x.property_type} • {x.address}</div>
                  <div className="muted">Телефон: {x.phone ?? '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="price">{Number(x.price_rub).toLocaleString('ru-RU')} ₽</div>
                  <div className="pill">{x.status}</div>
                </div>
              </div>

              <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                <Link className="btn small secondary" href={`/dashboard/${x.id}/edit`}>Редактировать</Link>

                <form action={`/api/admin/listings?id=${x.id}`} method="post">
                  <input type="hidden" name="_method" value="PATCH" />
                  <input type="hidden" name="status" value="active" />
                  <button className="btn small" type="submit">Опубликовать</button>
                </form>

                <form action={`/api/admin/listings?id=${x.id}`} method="post">
                  <input type="hidden" name="_method" value="PATCH" />
                  <input type="hidden" name="status" value="draft" />
                  <button className="btn small secondary" type="submit">В черновик</button>
                </form>

                <form action={`/api/admin/listings?id=${x.id}`} method="post">
                  <input type="hidden" name="_method" value="PATCH" />
                  <input type="hidden" name="status" value="archived" />
                  <button className="btn small secondary" type="submit">В архив</button>
                </form>

                <form action={`/api/admin/listings?id=${x.id}`} method="post">
                  <input type="hidden" name="_method" value="DELETE" />
                  <button className="btn small danger" type="submit">Удалить</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
