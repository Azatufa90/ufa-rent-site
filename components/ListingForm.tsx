'use client';

import { useMemo, useState } from 'react';
import MediaDropzone from './MediaDropzone';

const DISTRICTS = ['Кировский','Советский','Ленинский','Орджоникидзевский','Калининский','Дёмский'];
const TYPES = ['Комната','Студия','1 Комнатная','2-Х комнатная','3-Х комнатная','4-5 комнатная'];

export default function ListingForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: any;
}) {
  const [lat, setLat] = useState<number>(initial?.lat ?? 0);
  const [lng, setLng] = useState<number>(initial?.lng ?? 0);

  const [draftId] = useState<string>(() => initial?.id ?? crypto.randomUUID());

  // медиа
  const [photos, setPhotos] = useState<string[]>(Array.isArray(initial?.photos) ? initial.photos : []);
  const [videos, setVideos] = useState<string[]>(Array.isArray(initial?.videos) ? initial.videos : []);

  const action = useMemo(() => {
    if (mode === 'edit') return `/api/listings?id=${initial?.id}`;
    return '/api/listings';
  }, [mode, initial]);

  return (
    <form className="card" action={action} method="post" style={{ maxWidth: 900 }}>
      <input type="hidden" name="id_client" value={draftId} />

      {/* ✅ Гарантированно отправляем фото/видео в API как JSON */}
      <input type="hidden" name="photos_json" value={JSON.stringify(photos ?? [])} />
      <input type="hidden" name="videos_json" value={JSON.stringify(videos ?? [])} />

      <div className="stack">
        <label className="label">Заголовок</label>
        <input className="input" name="title" defaultValue={initial?.title ?? ''} required />

        <label className="label">Описание</label>
        <textarea className="input" name="description" rows={5} defaultValue={initial?.description ?? ''} />

        <label className="label">Адрес (Уфа)</label>
        <input className="input" name="address" defaultValue={initial?.address ?? ''} required />

        <div className="row" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Район</label>
            <select className="input" name="district" defaultValue={initial?.district ?? 'Советский'} required>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Тип объекта</label>
            <select className="input" name="property_type" defaultValue={initial?.property_type ?? '1 Комнатная'} required>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Цена (₽/мес)</label>
            <input className="input" name="price_rub" type="number" defaultValue={initial?.price ?? 0} required />
          </div>
        </div>

        <div className="row" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Комнаты</label>
            <input className="input" name="rooms" type="number" defaultValue={initial?.rooms ?? ''} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Площадь (м²)</label>
            <input className="input" name="area_m2" type="number" step="0.1" defaultValue={initial?.area_m2 ?? ''} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Этаж</label>
            <input className="input" name="floor" type="number" defaultValue={initial?.floor ?? ''} />
          </div>
        </div>

        <label className="label">Телефон (видят только админы)</label>
        <input className="input" name="phone" defaultValue={initial?.phone ?? ''} placeholder="+7..." />

        <div className="divider" />
        <div className="section-title">Фото / Видео</div>

        <MediaDropzone
          listingId={draftId}
          photos={photos}
          videos={videos}
          onChange={(next) => {
            setPhotos(next?.photos ?? []);
            setVideos(next?.videos ?? []);
          }}
        />

        <div className="divider" />

        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="label">Локация (вручную)</div>
            <div className="muted">Если не знаешь координаты — оставь 0.</div>
          </div>
          <div className="pill">
            lat: {lat ? lat.toFixed(5) : '—'} • lng: {lng ? lng.toFixed(5) : '—'}
          </div>
        </div>

        {/* Ручной ввод координат */}
        <div className="row" style={{ flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Широта (lat)</label>
            <input
              className="input"
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              placeholder="54.73..."
            />
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Долгота (lng)</label>
            <input
              className="input"
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              placeholder="55.96..."
            />
          </div>
        </div>

        {/* hidden координаты в API */}
        <input type="hidden" name="lat" value={lat} />
        <input type="hidden" name="lng" value={lng} />


        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" type="submit">Сохранить</button>
        </div>
      </div>
    </form>
  );
}
