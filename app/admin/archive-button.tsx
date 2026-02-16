"use client";

import { useState } from "react";

export default function ArchiveButton({
  id,
  onDone,
}: {
  id: string;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function archive() {
    if (!confirm("Переместить объявление в архив (СДАНО)?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/objects/${id}/archive`, {
        method: "PATCH",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.error ?? "Ошибка архивации");
        return;
      }
      onDone?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn secondary" onClick={archive} disabled={loading}>
      {loading ? "..." : "В архив"}
    </button>
  );
}
