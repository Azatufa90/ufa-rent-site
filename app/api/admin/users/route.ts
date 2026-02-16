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
  if (!profile || profile.role !== "superadmin")
    return { ok: false as const, status: 403, error: "forbidden" };

  return { ok: true as const, userId: user.id };
}

// GET: список
export async function GET() {
  const guard = await requireSuperadmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { data: usersData, error: listErr } =
    await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });

  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

  const users = usersData.users ?? [];
  const ids = users.map((u) => u.id);

  const { data: profiles, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, role, can_view_phones")
    .in("id", ids);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

  const map = new Map((profiles ?? []).map((p) => [p.id, p]));

  const rows = users.map((u) => {
    const p: any = map.get(u.id);
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      role: p?.role ?? "user",
      can_view_phones: !!p?.can_view_phones,
    };
  });

  return NextResponse.json({ rows });
}

// PATCH: изменить роль/доступ
export async function PATCH(req: Request) {
  const guard = await requireSuperadmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const role = body?.role as "user" | "admin" | "superadmin" | undefined;
  const can_view_phones = body?.can_view_phones as boolean | undefined;

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // защита от самоубийства: нельзя снять superadmin с себя
  if (userId === guard.userId && role && role !== "superadmin") {
    return NextResponse.json({ error: "cannot change your own role" }, { status: 400 });
  }

  const update: any = {};
  if (role) update.role = role;
  if (typeof can_view_phones === "boolean") update.can_view_phones = can_view_phones;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE: удалить пользователя
export async function DELETE(req: Request) {
  const guard = await requireSuperadmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // нельзя удалить себя
  if (userId === guard.userId) {
    return NextResponse.json({ error: "cannot delete yourself" }, { status: 400 });
  }

  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  // на всякий случай чистим профиль
  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  return NextResponse.json({ ok: true });
}
