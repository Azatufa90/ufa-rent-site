import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("objects")
    .select("id,title,price,created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 16px" }}>
      <h1 className="h1">Аренда квартир в Уфе</h1>
      <p className="muted">Свежие предложения на длительный срок</p>

      <div style={{ marginTop: 32 }}>
        <h2 className="h2">Свежие объявления</h2>

        {error && <p className="error">{error.message}</p>}

        {!data || data.length === 0 ? (
          <p className="muted">Пока нет объявлений</p>
        ) : (
          <div className="stack">
            {data.map((x) => (
              <Link
                key={x.id}
                href={`/catalog/${x.id}`}
                className="card"
                style={{
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{x.title}</div>
                  <div className="muted">{x.price} ₽</div>
                </div>

                <span className="btn secondary">Открыть</span>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Link href="/catalog" className="btn">
            Смотреть все объявления
          </Link>
        </div>
      </div>
    </div>
  );
}
