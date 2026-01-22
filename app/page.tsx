import { supabaseServer } from '@/lib/supabase/server';
import ListingCard from '@/components/ListingCard';
import TypeSections from '@/components/TypeSections';
import FilterBar from '@/components/FilterBar';

export default async function HomePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const supabase = supabaseServer();

  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const district = typeof searchParams.district === 'string' ? searchParams.district : '';
  const type = typeof searchParams.type === 'string' ? searchParams.type : '';
  const min = typeof searchParams.min === 'string' ? Number(searchParams.min) : null;
  const max = typeof searchParams.max === 'string' ? Number(searchParams.max) : null;

  let query = supabase
    .from('listings_public')
    .select('*')
    .eq('city', 'Уфа')
    .order('created_at', { ascending: false })
    .limit(60);

  if (district) query = query.eq('district', district);
  if (type) query = query.eq('property_type', type);
  if (min !== null && !Number.isNaN(min)) query = query.gte('price_rub', min);
  if (max !== null && !Number.isNaN(max)) query = query.lte('price_rub', max);

  if (q) {
    const s = `%${q}%`;
    query = query.or(`title.ilike.${s},address.ilike.${s},description.ilike.${s}`);
  }

  const { data, error } = await query;

  return (
    <div>
      <h1 className="h1">Аренда квартир в городе Уфа</h1>
      <p className="muted">Выбери раздел или настрой фильтры. В каталоге показываются только активные объявления.</p>

      <TypeSections />
      <FilterBar />

      {error ? <p className="error">Ошибка загрузки: {error.message}</p> : null}

      <div className="grid">
        {(data ?? []).map((x: any) => (
          <ListingCard key={x.id} listing={x} />
        ))}
      </div>
    </div>
  );
}
