'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

const DISTRICTS = ['','Кировский','Советский','Ленинский','Орджоникидзевский','Калининский','Дёмский'];
const TYPES = ['','Комната','Студия','1 Комнатная','2-Х комнатная','3-Х комнатная','4-5 комнатная'];

export default function FilterBar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get('q') ?? '');
  const [district, setDistrict] = useState(sp.get('district') ?? '');
  const [type, setType] = useState(sp.get('type') ?? '');
  const [min, setMin] = useState(sp.get('min') ?? '');
  const [max, setMax] = useState(sp.get('max') ?? '');

  const hasAny = useMemo(() => !!(q || district || type || min || max), [q, district, type, min, max]);

  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (district) params.set('district', district);
    if (type) params.set('type', type);
    if (min) params.set('min', min);
    if (max) params.set('max', max);
    router.push('/?' + params.toString());
  }

  function clearAll() {
    setQ(''); setDistrict(''); setType(''); setMin(''); setMax('');
    router.push('/');
  }

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: 2, minWidth: 220 }}
          placeholder="Поиск: адрес, описание, заголовок…"
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
        />
        <select className="input" style={{ flex: 1, minWidth: 180 }} value={district} onChange={(e) => setDistrict(e.target.value)}>
          {DISTRICTS.map((d) => <option key={d || 'all'} value={d}>{d || 'Все районы'}</option>)}
        </select>
        <select className="input" style={{ flex: 1, minWidth: 180 }} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => <option key={t || 'all'} value={t}>{t || 'Все типы'}</option>)}
        </select>
        <input className="input" style={{ width: 140 }} placeholder="Цена от" value={min} onChange={(e) => setMin(e.target.value)} />
        <input className="input" style={{ width: 140 }} placeholder="Цена до" value={max} onChange={(e) => setMax(e.target.value)} />
        <button className="btn" type="button" onClick={apply}>Применить</button>
        {hasAny ? <button className="btn secondary" type="button" onClick={clearAll}>Сброс</button> : null}
      </div>
    </div>
  );
}
