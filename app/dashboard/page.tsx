export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = supabaseServer();

  // кто вошел
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userErr || !user) {
    return (
      <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
        <h1 className="h1">Мои объекты</h1>
        <p className="muted">Нужно войти в аккаунт.</p>
        <Link className="btn" href="/login">
          Войти
        </Link>
      </div>
    );
  }

  // грузим объекты (ВАЖНО: price, а не price_rub)
  const { data, error } = await supabase
    .from("objects")
    .select("id,title,price,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="h1">Мои объекты</h1>
          <p className="muted">Ты админ: видишь все объекты.</p>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Link className="btn secondary" href="/catalog">
            Каталог
          </Link>
          <Link className="btn" href="/admin/new">
            + Добавить объект
          </Link>
        </div>
      </div>

      {error ? <p className="error">Ошибка: {error.message}</p> : null}

      <div style={{ marginTop: 16 }}>
        {!data || data.length === 0 ? (
          <p className="muted">Пока пусто. Создай объект через “+ Добавить объект”.</p>
        ) : (
          <div className="stack">
            {data.map((x) => (
              <div
                key={x.id}
                className="card"
                style={{
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{x.title}</div>
                  <div className="muted">{x.price} ₽</div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn secondary" href={`/catalog/${x.id}`}>
                    Открыть
                  </Link>
                  <Link className="btn secondary" href={`/admin/edit/${x.id}`}>
                    Редактировать
                  </Link>
                  <form action={`/api/admin/objects/${x.id}`} method="post">
                    <input type="hidden" name="_method" value="DELETE" />
                    <button className="btn secondary" type="submit">
                      Удалить
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
