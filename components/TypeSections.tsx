import Link from 'next/link';

const TYPES: { label: string; type: string; hint: string }[] = [
  { label: 'Комнаты', type: 'Комната', hint: 'Недорого • быстрый подбор' },
  { label: 'Студии', type: 'Студия', hint: 'Современные планировки' },
  { label: '1шки', type: '1 Комнатная', hint: 'Самый популярный формат' },
  { label: '2шки', type: '2-Х комнатная', hint: 'Комфорт для пары/семьи' },
  { label: '3шки', type: '3-Х комнатная', hint: 'Много места' },
  { label: '4–5 комнатные', type: '4-5 комнатная', hint: 'Большие квартиры' },
];

export default function TypeSections() {
  return (
    <div className="sections">
      {TYPES.map((x) => (
        <Link key={x.type} className="section-card" href={`/?type=${encodeURIComponent(x.type)}`}>
          <div className="section-title">{x.label}</div>
          <div className="muted">{x.hint}</div>
          <div className="section-cta">Смотреть →</div>
        </Link>
      ))}
    </div>
  );
}
