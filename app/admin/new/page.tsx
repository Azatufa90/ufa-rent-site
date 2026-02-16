"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import MediaDropzone from "@/components/MediaDropzone";

const DISTRICTS = ["Кировский","Советский","Ленинский","Орджоникидзевский","Калининский","Дёмский"];
const TYPES = ["Комната","Студия","1 Комнатная","2-Х комнатная","3-Х комнатная","4-5 комнатная"];

export default function AdminNewPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  // доп. поля
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Советский");
  const [propertyType, setPropertyType] = useState("1 Комнатная");
  const [rooms, setRooms] = useState<string>("");
  const [areaM2, setAreaM2] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);

  // медиа
  const [draftId] = useState<string>(() => crypto.randomUUID());
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const priceNum = useMemo(() => Number(price), [price]);

  async function save() {
    setLoading(true);
    setErr(null);

    const t = title.trim();
    const p = Number(priceNum);

    if (!t) {
      setErr("Введите заголовок");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(p) || p <= 0) {
      setErr("Введите корректную цену (число больше 0)");
      setLoading(false);
      return;
    }

    // user
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      setErr(userErr.message);
      setLoading(false);
      return;
    }
    const user = userData?.user;
    if (!user) {
      router.push("/login?next=/admin/new");
      router.refresh();
      return;
    }

    const payload: any = {
      title: t,
      price: Math.round(p),
      user_id: user.id,

      // доп. поля (необязательные)
      description: description?.trim() || null,
      address: address?.trim() || null,
      district: district || null,
      property_type: propertyType || null,
      rooms: rooms === "" ? null : Number(rooms),
      area_m2: areaM2 === "" ? null : Number(areaM2),
      floor: floor === "" ? null : Number(floor),
      phone: phone?.trim() || null,
      lat: lat || null,
      lng: lng || null,

      // медиа (массивы url)
      photos,
      videos,

      // если нужно хранить client-id (опционально)
      // id_client: draftId,
    };

    const { error: insertErr } = await supabase.from("objects").insert([payload]);

    if (insertErr) {
      setErr(insertErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="card" style={{ maxWidth: 900, margin: "48px auto" }}>
      <h1 className="h1">Добавить объект</h1>

      <div className="stack">
        <label className="label">Заголовок</label>
        <input
          className="input"
          placeholder="Например: 1к квартира, Черниковка"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="label">Цена (₽/мес)</label>
        <input
          className="input"
          placeholder="Например: 25000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div className="divider" />
        <div className="section-title">Дополнительно (необязательно)</div>

        <label className="label">Описание</label>
        <textarea
          className="input"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="label">Адрес (Уфа)</label>
        <input
          className="input"
          placeholder="Улица, дом"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="row" style={{ flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Район</label>
            <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Тип объекта</label>
            <select className="input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row" style={{ flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Комнаты</label>
            <input className="input" type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Площадь (м²)</label>
            <input className="input" type="number" step="0.1" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Этаж</label>
            <input className="input" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
          </div>
        </div>

        <label className="label">Телефон (для админа)</label>
        <input
          className="input"
          placeholder="+7..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Широта (lat)</label>
            <input
              className="input"
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              placeholder="54.73..."
            />
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Долгота (lng)</label>
            <input
              className="input"
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              placeholder="55.96..."
            />
          </div>
        </div>

        <div className="divider" />
        <div className="section-title">Фото / Видео</div>

        <MediaDropzone
          listingId={draftId}
          photos={photos}
          videos={videos}
          onChange={(next) => {
            setPhotos(next.photos);
            setVideos(next.videos);
          }}
        />

        {err && <p className="error">{err}</p>}

        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="btn secondary" type="button" onClick={() => router.push("/admin")} disabled={loading}>
            Назад
          </button>

          <button className="btn" type="button" onClick={save} disabled={loading}>
            {loading ? "Сохраняю…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
