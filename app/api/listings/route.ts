import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
function num(fd: FormData, key: string) {
  const v = fd.get(key);
  const n = typeof v === "string" ? Number(v) : 0;
  return Number.isFinite(n) ? n : 0;
}
function jsonArr(fd: FormData, key: string): string[] {
  const raw = str(fd, key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

async function requireAdmin(supabase: ReturnType<typeof supabaseServer>) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false as const, status: 401, reason: "no-user" };
  }

  const userId = userData.user.id;

  const { data: adminRow, error: adminErr } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminErr || !adminRow) {
    return { ok: false as const, status: 403, reason: "not-admin" };
  }

  return { ok: true as const, userId };
}

export async function POST(req: Request) {
  const supabase = supabaseServer();

  // 1) только админ
  const adm = await requireAdmin(supabase);
  if (!adm.ok) {
    return NextResponse.json({ ok: false, reason: adm.reason }, { status: adm.status });
  }

  // 2) режим: create или edit
  const url = new URL(req.url);
  const idFromQuery = (url.searchParams.get("id") || "").trim(); // edit: /api/listings?id=UUID

  const fd = await req.formData();
  const id = (idFromQuery || str(fd, "id_client")).trim();

  if (!id) return NextResponse.json({ ok: false, reason: "missing-id" }, { status: 400 });

  // 3) общий payload (без id) — одинаковый для insert/update
  const payload: any = {
    title: str(fd, "title"),
    description: str(fd, "description"),
    address: str(fd, "address"),
    district: str(fd, "district"),
    property_type: str(fd, "property_type"),
    price: num(fd, "price_rub"),
    rooms: num(fd, "rooms"),
    area_m2: num(fd, "area_m2"),
    floor: num(fd, "floor"),
    phone: str(fd, "phone"),
    lat: num(fd, "lat"),
    lng: num(fd, "lng"),

    // ✅ медиа
    photos: jsonArr(fd, "photos_json"),
    videos: jsonArr(fd, "videos_json"),
  };

  if (!payload.title) {
    return NextResponse.json({ ok: false, reason: "missing-title" }, { status: 400 });
  }

  // 4) create → INSERT (ставим owner_id)
  if (!idFromQuery) {
    const insertPayload = {
      id,
      ...payload,
      owner_id: adm.userId, // ✅ важно для кабинета/фильтров
    };

    const { error } = await supabase.from("objects").insert(insertPayload);

    if (error) {
      return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });
    }

    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 5) edit → UPDATE (не insert!)
  const { error } = await supabase
    .from("objects")
    .update(payload)
    .eq("id", idFromQuery);

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });
  }

  return NextResponse.redirect(new URL(`/admin/edit/${idFromQuery}`, req.url));
}
