import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

function safeUuid(v: string) {
  return /^[0-9a-fA-F-]{36}$/.test(v);
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  const form = await req.formData();
  const methodOverride = (form.get('_method')?.toString() ?? '').toUpperCase();

  // DELETE через POST (удобно для form)
  if (methodOverride === 'DELETE' && id) {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // media from hidden inputs (JSON arrays of storage paths)
  const photosJson = form.get('photos_json')?.toString() ?? '[]';
  const videosJson = form.get('videos_json')?.toString() ?? '[]';
  let photos: string[] = [];
  let videos: string[] = [];
  try { photos = JSON.parse(photosJson); } catch { photos = []; }
  try { videos = JSON.parse(videosJson); } catch { videos = []; }

  const payload: any = {
    owner_id: user.id,
    title: form.get('title')?.toString() ?? '',
    description: form.get('description')?.toString() ?? '',
    address: form.get('address')?.toString() ?? '',
    city: 'Уфа',
    district: form.get('district')?.toString() ?? 'Советский',
    property_type: form.get('property_type')?.toString() ?? '1 Комнатная',
    price_rub: Number(form.get('price_rub') ?? 0),
    rooms: form.get('rooms') ? Number(form.get('rooms')) : null,
    area_m2: form.get('area_m2') ? Number(form.get('area_m2')) : null,
    floor: form.get('floor') ? Number(form.get('floor')) : null,
    photos,
    videos,
    lat: form.get('lat') ? Number(form.get('lat')) : null,
    lng: form.get('lng') ? Number(form.get('lng')) : null,
    phone: form.get('phone')?.toString() ?? null,
    status: 'active',
  };

  // Create
  if (!id) {
    const idClient = (form.get('id_client')?.toString() ?? '').trim();
    if (idClient && safeUuid(idClient)) payload.id = idClient;

    const { error } = await supabase.from('listings').insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Update (owner policy or admin policy)
  const { error } = await supabase.from('listings').update(payload).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
