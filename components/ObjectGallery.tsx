"use client";

import { useMemo, useState } from "react";

export default function ObjectGallery({
  photos,
  videos,
}: {
  photos: string[];
  videos: string[];
}) {
  const items = useMemo(() => {
    const p = (photos || []).map((url) => ({ type: "photo" as const, url }));
    const v = (videos || []).map((url) => ({ type: "video" as const, url }));
    return [...p, ...v];
  }, [photos, videos]);

  const [idx, setIdx] = useState(0);
  const active = items[idx];

  if (!items.length) {
    return (
      <div
        className="muted"
        style={{
          border: "1px dashed rgba(255,255,255,0.18)",
          borderRadius: 12,
          padding: 18,
        }}
      >
        Фото/видео не добавлены.
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="card" style={{ padding: 12 }}>
        {active.type === "photo" ? (
          <img
            src={active.url}
            alt="Фото объекта"
            style={{
              width: "100%",
              maxHeight: 520,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
        ) : (
          <video
            src={active.url}
            controls
            style={{
              width: "100%",
              maxHeight: 520,
              borderRadius: 12,
            }}
          />
        )}
      </div>

      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <button
            key={it.url}
            type="button"
            className={`btn ${i === idx ? "" : "secondary"}`}
            onClick={() => setIdx(i)}
          >
            {it.type === "photo" ? `Фото ${i + 1}` : `Видео ${i + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}
