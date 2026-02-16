import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function requireSuperadmin() {
  const supabase = supabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false as const, status: 401, error: "unauthorized" };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { ok: false as const, status: 500, error: error.message };
  if (!profile || profile.role !== "superadmin") {
    return { ok: false as const, status: 403, error: "forbidden" };
  }

  return { ok: true as const, userId: user.id };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const targetId = params.id;

  // НЕЛЬЗЯ менять самого себя (на всякий случай)
  if (targetId === guard.userId) {
    return NextResponse.json({ error: "Нельзя менять самого superadmin через этот экран" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const nextRole = body?.role as ("user" | "admin" | undefined);
  const nextCanViewPhones = body?.can_view_phones as (boolean | undefined);

  // Проверяем цель: вдруг это superadmin
  const { data: targetProfile, error: targetErr } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", targetId)
    .maybeSingle();

  if (targetErr) return NextResponse.json({ error: targetErr.message }, { status: 500 });

  // Если профиля нет — создадим базовый (на всякий)
  const targetRole = targetProfile?.role;

  // НЕЛЬЗЯ трогать superadmin
  if (targetRole === "superadmin") {
    return NextResponse.json({ error: "Нельзя изменять superadmin" }, { status: 403 });
  }

  // Собираем апдейт (superadmin роль вообще не принимаем)
  const update: any = {};
  if (nextRole) {
    if (nextRole !== "user" && nextRole !== "admin") {
      return NextResponse.json({ error: "Недопустимая роль" }, { status: 400 });
    }
    update.role = nextRole;
  }
  if (typeof nextCanViewPhones === "boolean") {
    update.can_view_phones = nextCanViewPhones;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ ok: true });
  }

  // Обновляем profiles через service_role
  const { error: upErr } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: targetId, ...update }, { onConflict: "id" });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Синхронизируем таблицу admins (чтобы /admin и API is-admin работали)
  if (update.role === "admin") {
    const { error: aErr } = await supabaseAdmin
      .from("admins")
      .upsert({ user_id: targetId }, { onConflict: "user_id" });
    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  }

  if (update.role === "user") {
    const { error: dErr } = await supabaseAdmin
      .from("admins")
      .delete()
      .eq("user_id", targetId);
    if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const targetId = params.id;

  // НЕЛЬЗЯ удалить самого себя
  if (targetId === guard.userId) {
    return NextResponse.json({ error: "Нельзя удалить самого superadmin" }, { status: 400 });
  }

  // НЕЛЬЗЯ удалить superadmin
  const { data: targetProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", targetId)
    .maybeSingle();

  if (targetProfile?.role === "superadmin") {
    return NextResponse.json({ error: "Нельзя удалить superadmin" }, { status: 403 });
  }

  // Удаляем из Auth
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(targetId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  // Чистим admins + profiles (не обязательно, но красиво)
  await supabaseAdmin.from("admins").delete().eq("user_id", targetId);
  await supabaseAdmin.from("profiles").delete().eq("id", targetId);

  return NextResponse.json({ ok: true });
}
