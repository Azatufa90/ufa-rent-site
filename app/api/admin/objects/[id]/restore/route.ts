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

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireSuperadmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const id = params.id;

  // ✅ снимаем архив через service_role
  const { error } = await supabaseAdmin
    .from("objects")
    .update({ is_archived: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
