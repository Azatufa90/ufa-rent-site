'use client';

import { useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

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

  const photoPreviews = useMemo(() => {
    return (photos ?? []).map((p) => {
      const { data } = supabase.storage.from('listing-photos').getPublicUrl(p);
      return { path: p, url: data.publicUrl };
    });
  }, [photos, supabase]);

  const videoPreviews = useMemo(() => {
    return (videos ?? []).map((p) => {
      const { data } = supabase.storage.from('listing-photos').getPublicUrl(p);
      return { path: p, url: data.publicUrl };
    });
  }, [videos, supabase]);

  async function upload(files: File[]) {
    setErr(null);
    setUploading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setErr('Нужно войти, чтобы загружать медиа');
      setUploading(false);
      return;
    }

    const newPhotos: string[] = [];
    const newVideos: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;

      // простая защита от огромных файлов (можно поменять)
      const maxMb = isVideo ? 80 : 15;
      if (file.size > maxMb * 1024 * 1024) {
        setErr(`Файл слишком большой: максимум ${maxMb}MB`);
        continue;
      }

      const safeName = String(Date.now()) + '-' + file.name.split(' ').join('-');
      const folder = isImage ? 'photos' : 'videos';
      const path = `${user.id}/${listingId}/${folder}/${safeName}`;

      const { error } = await supabase.storage
        .from('listing-photos')
        .upload(path, file, { cacheControl: '3600', upsert: false });

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
          <div className="muted" style={{ marginTop: 6 }}>Форматы: JPG/PNG/WEBP • MP4/MOV</div>
        </div>

        <label className="btn secondary" style={{ marginTop: 10, display: 'inline-block' }}>
          Выбрать файлы
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
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
              <img className="upload-img" src={x.url} alt="" />
              <button type="button" className="btn small danger" onClick={() => removePhoto(x.path)}>Удалить</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="section-title">Видео</div>
        <div className="upload-grid">
          {videoPreviews.map((x) => (
            <div key={x.path} className="upload-item">
              <video className="upload-video" controls src={x.url} />
              <button type="button" className="btn small danger" onClick={() => removeVideo(x.path)}>Удалить</button>
            </div>
          ))}
        </div>
      </div>

      <input type="hidden" name="photos_json" value={JSON.stringify(photos ?? [])} />
      <input type="hidden" name="videos_json" value={JSON.stringify(videos ?? [])} />
    </div>
  );
}
