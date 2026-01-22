import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export default async function ListingPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const { data: listing, error } = await supabase
    .from('listings_public')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !listing) {
    return <p className="error">Объект не найден.</p>;
  }

  const photos: string[] = listing.photos ?? [];
  const videos: string[] = listing.videos ?? [];

  const photoUrls = photos.map((p) => supabase.storage.from('listing-photos').getPublicUrl(p).data.publicUrl);
  const videoUrls = videos.map((p) => supabase.storage.from('listing-photos').getPublicUrl(p).data.publicUrl);

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 className="h1">{listing.title}</h1>
          <p className="muted">{listing.district} • {listing.property_type} • {listing.address}</p>
        </div>
        <Link className="btn secondary" href="/">← Назад</Link>
      </div>

      <div className="row" style={{ gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 2, minWidth: 320 }}>
          <div className="price big">{Number(listing.price_rub).toLocaleString('ru-RU')} ₽/мес</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Телефон: {listing.phone ? listing.phone : 'доступно только админам'}
          </div>
          <div className="divider" />
          <div className="muted">{listing.description || '—'}</div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 260 }}>
          <div className="section-title">Характеристики</div>
          <div className="muted">Комнаты: {listing.rooms ?? '—'}</div>
          <div className="muted">Площадь: {listing.area_m2 ?? '—'} м²</div>
          <div className="muted">Этаж: {listing.floor ?? '—'}</div>
          <div className="muted">lat/lng: {listing.lat ?? '—'} / {listing.lng ?? '—'}</div>
        </div>
      </div>

      {photoUrls.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title">Фото</div>
          <div className="upload-grid">
            {photoUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img className="upload-img" src={url} alt="" />
              </a>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>Нажми на фото, чтобы открыть в полном размере.</div>
        </div>
      ) : null}

      {videoUrls.length ? (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title">Видео</div>
          <div className="upload-grid">
            {videoUrls.map((url) => (
              <video key={url} className="upload-video" controls src={url} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
