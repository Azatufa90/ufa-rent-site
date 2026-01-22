'use client';

import { useMemo, useState } from 'react';
import MapPicker from './MapPicker';
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
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [videos, setVideos] = useState<string[]>(initial?.videos ?? []);

  const action = useMemo(() => {
    if (mode === 'edit') return `/api/listings?id=${initial.id}`;
    return '/api/listings';
  }, [mode, initial]);

  return (
    <form className="card" action={action} method="post" style={{ maxWidth: 900 }}>
      <input type="hidden" name="id_client" value={draftId} />

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
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Тип объекта</label>
            <select className="input" name="property_type" defaultValue={initial?.property_type ?? '1 Комнатная'} required>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Цена (₽/мес)</label>
            <input className="input" name="price_rub" type="number" defaultValue={initial?.price_rub ?? 0} required />
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
          onChange={(next) => { setPhotos(next.photos); setVideos(next.videos); }}
        />

        <div className="divider" />
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="label">Локация (клик по карте)</div>
            <div className="muted">Выбирай точку в пределах Уфы.</div>
          </div>
          <div className="pill">lat: {lat ? lat.toFixed(5) : '—'} • lng: {lng ? lng.toFixed(5) : '—'}</div>
        </div>

        <input type="hidden" name="lat" value={lat} />
        <input type="hidden" name="lng" value={lng} />

        <MapPicker lat={lat} lng={lng} onPick={(a, b) => { setLat(a); setLng(b); }} />

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" type="submit">Сохранить</button>
        </div>
      </div>
    </form>
  );
}
