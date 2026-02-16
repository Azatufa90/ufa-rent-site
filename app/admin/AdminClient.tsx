"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ArchiveButton from "./archive-button";

type Item = {
  id: string;
  title: string | null;
  price: number | null;
  created_at?: string | null;
  is_archived?: boolean | null;
};

function Badge({ text, variant }: { text: string; variant: "active" | "archived" }) {
  const bg =
    variant === "active" ? "rgba(34,197,94,0.18)" : "rgba(245,158,11,0.18)";
  const border =
    variant === "active" ? "rgba(34,197,94,0.35)" : "rgba(245,158,11,0.35)";
  const color = variant === "active" ? "#86efac" : "#fcd34d";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export default function AdminClient({ items }: { items: Item[] }) {
  const router = useRouter();

  const [local, setLocal] = useState<Item[]>(() => items ?? []);
  const [busyId, setBusyId] = useState<string | null>(null);

  // права
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // у тебя /api/is-admin возвращает isAdmin:true для супер-админа
        const res = await fetch("/api/is-admin", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!cancelled) setIsSuperadmin(!!json?.isAdmin);
      } catch {
        if (!cancelled) setIsSuperadmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useMemo(() => {
    setLocal(items ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items?.length]);

  async function onDelete(id: string) {
    if (!isSuperadmin) {
      alert("Удалять может только superadmin.");
      return;
    }

    const ok = confirm("Удалить объект? Это действие нельзя отменить.");
    if (!ok) return;

    setBusyId(id);

    try {
      const res = await fetch(`/api/admin/objects/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        alert(`Ошибка удаления: ${json?.reason ?? json?.error ?? res.statusText}`);
        return;
      }

      setLocal((prev) => prev.filter((x) => x.id !== id));
      router.refresh();
    } catch (e: any) {
      alert(`Ошибка удаления: ${e?.message ?? "unknown"}`);
    } finally {
      setBusyId(null);
    }
  }

  async function onRestore(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/objects/${id}/restore`, { method: "POST" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        alert(`Ошибка восстановления: ${json?.reason ?? json?.error ?? res.statusText}`);
        return;
      }

      setLocal((prev) =>
        prev.map((x) => (x.id === id ? { ...x, is_archived: false } : x))
      );
      router.refresh();
    } catch (e: any) {
      alert(`Ошибка восстановления: ${e?.message ?? "unknown"}`);
    } finally {
      setBusyId(null);
    }
  }

  if (!local || local.length === 0) {
    return <div className="muted">Пока пусто. Создай объект через “+ Добавить объект”.</div>;
  }

  return (
    <div className="stack">
      {local.map((x) => {
        const archived = !!x.is_archived;

        return (
          <div
            key={x.id}
            className="card"
            style={{
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              opacity: archived ? 0.65 : 1,
            }}
          >
            <div style={{ minWidth: 240 }}>
              <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{x.title ?? "Без названия"}</div>
                {archived ? (
                  <Badge text="Сдано (в архиве)" variant="archived" />
                ) : (
                  <Badge text="Активно" variant="active" />
                )}
              </div>
              <div className="muted">{(x.price ?? 0).toLocaleString("ru-RU")} ₽</div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Link className="btn secondary" href={`/catalog/${x.id}`}>
                Открыть
              </Link>

              <Link className="btn secondary" href={`/admin/edit/${x.id}`}>
                Редактировать
              </Link>

              {!archived ? (
                // “Сдать” = отправить в архив
                <ArchiveButton id={x.id} />
              ) : (
                // “Вернуть” из архива
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => onRestore(x.id)}
                  disabled={busyId === x.id}
                  aria-busy={busyId === x.id}
                >
                  {busyId === x.id ? "..." : "Вернуть"}
                </button>
              )}

              {isSuperadmin ? (
                <button
                  className="btn"
                  type="button"
                  onClick={() => onDelete(x.id)}
                  disabled={busyId === x.id}
                  aria-busy={busyId === x.id}
                >
                  {busyId === x.id ? "Удаляю..." : "Удалить"}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
