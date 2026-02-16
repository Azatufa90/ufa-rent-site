export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("objects")
    .select("id,title,price,created_at,is_archived")
    .eq("is_archived", false) // ✅ показываем только активные
    .order("created_at", { ascending: false });

  return (
    <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">Админка</h1>
          <p className="muted">Добавление / удаление / редактирование объявлений.</p>
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Link className="btn secondary" href="/admin/archive">
            Архив
          </Link>

          <Link className="btn" href="/admin/new">
            + Добавить объект
          </Link>
        </div>
      </div>

      {error ? <p className="error">Ошибка загрузки: {error.message}</p> : null}

      <div style={{ marginTop: 16 }}>
        <AdminClient items={(data ?? []) as any[]} />
      </div>
    </div>
  );
}
