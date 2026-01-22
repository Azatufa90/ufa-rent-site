import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const form = await req.formData();
  const methodOverride = (form.get('_method')?.toString() ?? '').toUpperCase();

  if (methodOverride === 'DELETE') {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  if (methodOverride === 'PATCH') {
    const status = form.get('status')?.toString() ?? 'active';
    const { error } = await supabase.from('listings').update({ status }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.json({ error: 'Unsupported' }, { status: 400 });
}
