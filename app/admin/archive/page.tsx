export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import RestoreButton from "./restore-button";

function formatRub(v?: number | null) {
  const n = Number(v ?? 0);
  return n.toLocaleString("ru-RU") + " ₽";
}

export default async function ArchivePage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("objects")
    .select("id,title,price,created_at,is_archived")
    .eq("is_archived", true)
    .order("created_at", { ascending: false });

  return (
    <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="h1">Архив</h1>
          <p className="muted">Здесь объявления со статусом “Сдано” — они не показываются в каталоге.</p>
        </div>

        <Link className="btn secondary" href="/admin">
          ← Назад в админку
        </Link>
      </div>

      {error ? <p className="error">Ошибка загрузки: {error.message}</p> : null}

      <div style={{ marginTop: 16 }}>
        {!data || data.length === 0 ? (
          <div className="muted">Архив пуст.</div>
        ) : (
          <div className="stack">
            {data.map((o) => (
              <div
                key={o.id}
                className="card"
                style={{
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{o.title ?? "Без названия"}</div>
                  <div className="muted">{formatRub(o.price)}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    ID: {o.id}
                  </div>
                </div>

                <RestoreButton id={o.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
