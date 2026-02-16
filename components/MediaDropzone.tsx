"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function MediaDropzone({
  listingId,
  photos,
  videos,
  onChange,
}: {
  listingId: string;
  photos: string[];
  videos: string[];
  onChange: (next: { photos: string[]; videos: string[] }) => void;
}) {
  const supabase = supabaseBrowser();
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ один bucket для фото и видео
  const BUCKET = "listing-photos";

  const photoPreviews = useMemo(() => {
    return (photos ?? []).map((p) => {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(p);
      return { path: p, url: data.publicUrl };
    });
  }, [photos, supabase]);

  const videoPreviews = useMemo(() => {
    return (videos ?? []).map((p) => {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(p);
      return { path: p, url: data.publicUrl };
    });
  }, [videos, supabase]);

  function sanitizeFilename(original: string) {
    const parts = original.split(".");
    const ext = parts.length > 1 ? "." + parts.pop() : "";
    const base = parts.join(".") || "file";

    const safeBase = base
      .normalize("NFKD")
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    const safeExt = ext.replace(/[^\w.]+/g, "");
    return (safeBase || "file") + safeExt;
  }

  async function upload(files: File[]) {
    setErr(null);
    setUploading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setErr("Нужно войти, чтобы загружать медиа");
      setUploading(false);
      return;
    }

    const newPhotos: string[] = [];
    const newVideos: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) continue;

      // ✅ Видео — только mp4 (иначе часто не воспроизводится)
      if (isVideo && file.type !== "video/mp4") {
        setErr("Видео должно быть в формате MP4 (MOV часто не воспроизводится).");
        continue;
      }

      const maxMb = isVideo ? 120 : 15;
      if (file.size > maxMb * 1024 * 1024) {
        setErr(`Файл слишком большой: максимум ${maxMb}MB`);
        continue;
      }

      const safeFile = sanitizeFilename(file.name);
      const safeName = `${Date.now()}-${safeFile}`;
      const folder = isImage ? "photos" : "videos";

      // userId/listingId/photos|videos/filename
      const path = `${user.id}/${listingId}/${folder}/${safeName}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: isVideo ? "video/mp4" : file.type || "image/jpeg",
      });

      if (error) {
        setErr(error.message);
      } else {
        if (isImage) newPhotos.push(path);
        if (isVideo) newVideos.push(path);
      }
    }

    onChange({
      photos: [...(photos ?? []), ...newPhotos],
      videos: [...(videos ?? []), ...newVideos],
    });

    setUploading(false);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    upload(Array.from(e.dataTransfer.files ?? []));
  }

  function removePhoto(p: string) {
    onChange({ photos: (photos ?? []).filter((x) => x !== p), videos: videos ?? [] });
  }

  function removeVideo(p: string) {
    onChange({ photos: photos ?? [], videos: (videos ?? []).filter((x) => x !== p) });
  }

  return (
    <div>
      <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <div>
          <div className="drop-title">Перетащи фото или видео сюда</div>
          <div className="muted">или выбери файлы кнопкой ниже</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Форматы: JPG/PNG/WEBP • MP4
          </div>
        </div>

        <label className="btn secondary" style={{ marginTop: 10, display: "inline-block" }}>
          Выбрать файлы
          <input
            type="file"
            accept="image/*,video/mp4"
            multiple
            style={{ display: "none" }}
            onChange={(e) => upload(Array.from(e.target.files ?? []))}
          />
        </label>

        {uploading ? <div className="muted" style={{ marginTop: 10 }}>Загрузка…</div> : null}
        {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="section-title">Фото</div>
        <div className="upload-grid">
          {photoPreviews.map((x) => (
            <div key={x.path} className="upload-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="upload-img" src={x.url} alt="" />
              <button type="button" className="btn small danger" onClick={() => removePhoto(x.path)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="section-title">Видео</div>
        <div className="upload-grid">
          {videoPreviews.map((x) => (
            <div key={x.path} className="upload-item">
              <video className="upload-video" controls preload="metadata" style={{ background: "rgba(0,0,0,0.25)" }}>
                <source src={x.url} type="video/mp4" />
              </video>
              <button type="button" className="btn small danger" onClick={() => removeVideo(x.path)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>

      <input type="hidden" name="photos_json" value={JSON.stringify(photos ?? [])} />
      <input type="hidden" name="videos_json" value={JSON.stringify(videos ?? [])} />
    </div>
  );
}
