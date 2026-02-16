export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminOnlyLink from "@/app/components/AdminOnlyLink";

type Obj = {
  id: string;
  title: string | null;
  price: number | null;
  description: string | null;
  created_at: string;

  address: string | null;
  district: string | null;
  property_type: string | null;

  rooms: number | null;
  area_m2: number | null;
  floor: number | null;

  phone?: string | null;
  lat: number | null;
  lng: number | null;

  photos: string[] | null;
  videos: string[] | null;
};

function formatRub(v?: number | null) {
  const n = Number(v ?? 0);
  return n.toLocaleString("ru-RU") + " ₽";
}

function safeText(v?: string | null, fallback = "—") {
  const t = (v ?? "").trim();
  return t ? t : fallback;
}

// ✅ доступ к телефону определяем через service_role (не зависит от RLS)
async function getPhoneAccess() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { canSeePhone: false };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, can_view_phones")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile as any)?.role ?? "user";
  const canViewPhones = !!(profile as any)?.can_view_phones;

  const isSuperadmin = role === "superadmin";
  return { canSeePhone: isSuperadmin || canViewPhones };
}

export default async function CatalogItemPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const id = params.id;

  const access = await getPhoneAccess();

  // если нет доступа к телефону — phone НЕ выбираем
  const selectForAll =
    "id,title,price,description,created_at,address,district,property_type,rooms,area_m2,floor,lat,lng,photos,videos";
  const selectWithPhone = selectForAll + ",phone";

  const { data, error } = await supabase
    .from("objects")
    .select(access.canSeePhone ? selectWithPhone : selectForAll)
    .eq("id", id)
    .maybeSingle<Obj>();

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
        <Link className="btn secondary" href="/catalog">
          ← Назад в каталог
        </Link>
        <div style={{ marginTop: 16 }} className="error">
          Ошибка загрузки: {error.message}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card" style={{ maxWidth: 980, margin: "48px auto" }}>
        <Link className="btn secondary" href="/catalog">
          ← Назад в каталог
        </Link>
        <div style={{ marginTop: 16 }} className="muted">
          Объявление не найдено.
        </div>
      </div>
    );
  }

  const BUCKET = "listing-photos";

  const photoUrls =
    (data.photos ?? [])
      .map((path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
      .filter(Boolean) ?? [];

  const videoUrls =
    (data.videos ?? [])
      .map((path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
      .filter(Boolean) ?? [];

  const mainPhoto = photoUrls[0] ?? "";

  return (
    <div className="card" style={{ maxWidth: 1100, margin: "36px auto", padding: 18 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn secondary" href="/catalog">
          ← Назад в каталог
        </Link>

        <AdminOnlyLink className="btn" href="/admin">
          В админку
        </AdminOnlyLink>
      </div>

      <div
        className="card"
        style={{
          marginTop: 14,
          padding: 18,
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 260 }}>
          <div className="h1" style={{ marginBottom: 6 }}>
            {safeText(data.title)}
          </div>
          <div className="muted">Создано: {new Date(data.created_at).toLocaleString("ru-RU")}</div>
          <div className="muted" style={{ fontSize: 12 }}>ID: {data.id}</div>
        </div>

        <div style={{ textAlign: "right", minWidth: 200 }}>
          <div className="muted" style={{ marginBottom: 6 }}>Цена</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{formatRub(data.price)}</div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 14, alignItems: "stretch", gap: 14, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 2, minWidth: 320, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Галерея</div>

          {mainPhoto ? (
            <>
              <div
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 360,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainPhoto}
                  alt="Фото объекта"
                  style={{ width: "100%", height: 360, objectFit: "contain", display: "block" }}
                />
              </div>

              {photoUrls.length > 1 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  {photoUrls.map((u, i) => (
                    <a key={u} href={u} target="_blank" rel="noreferrer" title={`Открыть фото ${i + 1}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u}
                        alt={`Фото ${i + 1}`}
                        style={{
                          width: "100%",
                          height: 74,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "block",
                        }}
                      />
                    </a>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="muted">Фото пока не добавлены.</div>
          )}

          {videoUrls.length ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Видео</div>
              <div className="stack">
                {videoUrls.map((v) => (
                  <video key={v} controls preload="metadata" style={{ width: "100%", borderRadius: 14 }}>
                    <source src={v} type="video/mp4" />
                  </video>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280, padding: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Характеристики</div>

          <div className="stack" style={{ gap: 10 }}>
            <RowItem label="Адрес" value={safeText(data.address)} />
            <RowItem label="Район" value={safeText(data.district)} />
            <RowItem label="Тип" value={safeText(data.property_type)} />
            <RowItem label="Комнаты" value={data.rooms ?? "—"} />
            <RowItem label="Площадь" value={data.area_m2 ? `${data.area_m2} м²` : "—"} />
            <RowItem label="Этаж" value={data.floor ?? "—"} />
            <RowItem
              label="Координаты"
              value={data.lat && data.lng ? `${Number(data.lat).toFixed(5)}, ${Number(data.lng).toFixed(5)}` : "—"}
            />

            {access.canSeePhone ? (
              <>
                <RowItem label="Телефон" value={safeText(data.phone ?? null)} />
                {data.phone ? (
                  <a className="btn" href={`tel:${data.phone}`} style={{ marginTop: 6 }}>
                    Позвонить
                  </a>
                ) : null}
              </>
            ) : (
              <RowItem label="Телефон" value="Телефон доступен только тем, кому разрешил superadmin" />
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Описание</div>
        <div style={{ whiteSpace: "pre-wrap" }}>{safeText(data.description, "Описание не добавлено.")}</div>
      </div>
    </div>
  );
}

function RowItem({ label, value }: { label: string; value: any }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "baseline",
        paddingBottom: 8,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="muted">{label}</div>
      <div style={{ fontWeight: 700, textAlign: "right" }}>{value}</div>
    </div>
  );
}
