import ListingForm from '@/components/ListingForm';
import { supabaseServer } from '@/lib/supabase/server';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('listings').select('*').eq('id', params.id).single();

  if (error) return <p className="error">Не найдено: {error.message}</p>;

  return (
    <div>
      <h1 className="h1">Редактировать</h1>
      <ListingForm mode="edit" initial={data} />
    </div>
  );
}
