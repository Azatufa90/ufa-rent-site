import ListingForm from '@/components/ListingForm';

export default function NewListingPage() {
  return (
    <div>
      <h1 className="h1">Добавить объект</h1>
      <ListingForm mode="create" />
    </div>
  );
}
