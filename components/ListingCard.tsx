import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export default async function ListingCard({ listing }: { listing: any }) {
  const supabase = supabaseServer();

  const first = listing.photos?.[0];
  let photoUrl: string | null = null;
  if (first) {
    const { data } = supabase.storage.from('listing-photos').getPublicUrl(first);
    photoUrl = data.publicUrl;
  }

  return (
    <Link href={`/listing/${listing.id}`} className="card" style={{ display: 'block' }}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="thumb" src={photoUrl} alt={listing.title} />
      ) : (
        <div className="thumb placeholder">Фото</div>
      )}

      <div className="title">{listing.title}</div>
      <div className="muted">{listing.district} • {listing.property_type}</div>
      <div className="muted">{listing.address}</div>

      <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
        <div className="price">{Number(listing.price_rub).toLocaleString('ru-RU')} ₽/мес</div>
        <div className="pill">Уфа</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted">Телефон: {listing.phone ? listing.phone : 'доступно только админам'}</div>
      </div>
    </Link>
  );
}
