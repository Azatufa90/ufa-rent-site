"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  email: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  role: "user" | "admin" | "superadmin";
  can_view_phones: boolean;
};

export default function UsersClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Ошибка загрузки");
      setRows(json.rows || []);
    } catch (e: any) {
      setErr(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patchUser(id: string, body: Partial<Pick<Row, "role" | "can_view_phones">>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Ошибка сохранения");
  }

  async function deleteUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Ошибка удаления");
  }

  if (loading) return <div className="card" style={{ maxWidth: 980, margin: "36px auto" }}>Загрузка...</div>;
  if (err) return <div className="card" style={{ maxWidth: 980, margin: "36px auto" }}><div className="error">{err}</div></div>;

  return (
    <div className="card" style={{ maxWidth: 980, margin: "36px auto", padding: 18 }}>
      <div className="h1" style={{ marginBottom: 8 }}>Пользователи</div>
      <div className="muted" style={{ marginBottom: 14 }}>
        Только <b>superadmin</b> может менять роли и доступ к телефонам.
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 10 }}>Email</th>
              <th style={{ textAlign: "left", padding: 10 }}>Роль</th>
              <th style={{ textAlign: "left", padding: 10 }}>Видит телефоны</th>
              <th style={{ textAlign: "left", padding: 10 }}></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((u) => {
              const isSuper = u.role === "superadmin";

              return (
                <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: 10 }}>
                    <div style={{ fontWeight: 800 }}>{u.email || "—"}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{u.id}</div>
                  </td>

                  <td style={{ padding: 10 }}>
                    <select
                      value={u.role}
                      disabled={isSuper}
                      onChange={async (e) => {
                        const nextRole = e.target.value as Row["role"];

                        // superadmin в UI не даём ставить вообще
                        if (nextRole === "superadmin") return;

                        // оптимистично
                        const prev = rows;
                        setRows((r) => r.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));

                        try {
                          await patchUser(u.id, { role: nextRole });
                        } catch (err: any) {
                          alert(err.message || "Ошибка");
                          setRows(prev);
                        }
                      }}
                    >
                      {/* ВАЖНО: только user/admin */}
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      {/* superadmin не показываем в выборе */}
                    </select>

                    {isSuper ? (
                      <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                        superadmin (защищён)
                      </div>
                    ) : null}
                  </td>

                  <td style={{ padding: 10 }}>
                    <input
                      type="checkbox"
                      checked={!!u.can_view_phones}
                      disabled={isSuper}
                      onChange={async (e) => {
                        const next = e.target.checked;

                        const prev = rows;
                        setRows((r) => r.map((x) => (x.id === u.id ? { ...x, can_view_phones: next } : x)));

                        try {
                          await patchUser(u.id, { can_view_phones: next });
                        } catch (err: any) {
                          alert(err.message || "Ошибка");
                          setRows(prev);
                        }
                      }}
                    />
                  </td>

                  <td style={{ padding: 10 }}>
                    <button
                      className="btn secondary"
                      disabled={isSuper}
                      onClick={async () => {
                        if (isSuper) return;
                        if (!confirm("Удалить пользователя?")) return;
                        try {
                          await deleteUser(u.id);
                          setRows((r) => r.filter((x) => x.id !== u.id));
                        } catch (err: any) {
                          alert(err.message || "Ошибка");
                        }
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="btn" style={{ marginTop: 14 }} onClick={load}>
        Обновить список
      </button>
    </div>
  );
}
