export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import ListingForm from "@/components/ListingForm";

export default async function AdminEditPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = supabaseServer();

  const { data: obj, error } = await supabase
    .from("objects")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
        <h1 className="h1">Ошибка</h1>
        <p className="error">{error.message}</p>
        <Link className="btn secondary" href="/admin">Назад</Link>
      </div>
    );
  }

  if (!obj) {
    return (
      <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
        <h1 className="h1">Не найдено</h1>
        <p className="muted">Объект не найден.</p>
        <Link className="btn secondary" href="/admin">Назад</Link>
      </div>
    );
  }

  // ВАЖНО: ListingForm у тебя уже умеет mode="edit"
  return (
    <div style={{ maxWidth: 980, margin: "48px auto" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <h1 className="h1">Редактирование</h1>
        <div className="row" style={{ gap: 8 }}>
          <Link className="btn secondary" href="/admin">Назад</Link>
          <Link className="btn secondary" href={`/catalog/${obj.id}`}>Открыть в каталоге</Link>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <ListingForm mode="edit" initial={obj} />
      </div>
    </div>
  );
}
