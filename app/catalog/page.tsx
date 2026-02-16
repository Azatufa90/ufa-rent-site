export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import AdminOnlyLink from "@/app/components/AdminOnlyLink";

function formatRub(v?: number | null) {
  const n = Number(v ?? 0);
  return n.toLocaleString("ru-RU") + " ₽";
}

export default async function CatalogPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("objects")
    .select("id,title,price,created_at,is_archived")
    .eq("is_archived", false) // ✅ скрываем сданные
    .order("created_at", { ascending: false });

  return (
    <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="h1">Каталог</h1>
          <p className="muted">Только активные объявления (не в архиве).</p>
        </div>

        <AdminOnlyLink className="btn" href="/admin">
          В админку
        </AdminOnlyLink>
      </div>

      {error ? <p className="error">Ошибка загрузки: {error.message}</p> : null}

      <div style={{ marginTop: 16 }}>
        {!data || data.length === 0 ? (
          <div className="muted">Пока нет активных объявлений.</div>
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
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  textDecoration: "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{x.title ?? "Без названия"}</div>
                  <div className="muted">{formatRub(x.price)}</div>
                </div>

                <span className="btn secondary">Открыть</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
