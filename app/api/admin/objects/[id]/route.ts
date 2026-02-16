import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

async function requireSuperadmin(supabase: ReturnType<typeof supabaseServer>) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false as const, status: 401, reason: "no-user" };
  }

  const userId = userData.user.id;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false as const, status: 500, reason: error.message };
  }

  if (!profile || profile.role !== "superadmin") {
    return { ok: false as const, status: 403, reason: "not-superadmin" };
  }

  return { ok: true as const, userId };
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const supabase = supabaseServer();

  // ✅ защита: только superadmin
  const guard = await requireSuperadmin(supabase);
  if (!guard.ok) {
    return NextResponse.json(
      { ok: false, reason: guard.reason },
      { status: guard.status }
    );
  }

  const id = (ctx?.params?.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, reason: "missing-id" }, { status: 400 });
  }

  // ✅ удаляем объект
  const { error } = await supabase.from("objects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
