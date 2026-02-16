"use client";

import { useState } from "react";

export default function RestoreButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function restore() {
    if (!confirm("Вернуть объявление из архива в каталог?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/objects/${id}/restore`, { method: "PATCH" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.error ?? "Ошибка восстановления");
        return;
      }
      location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn" onClick={restore} disabled={loading}>
      {loading ? "..." : "Вернуть в каталог"}
    </button>
  );
}
