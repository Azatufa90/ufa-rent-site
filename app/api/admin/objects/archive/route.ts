import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function requireAdminOrSuperadmin() {
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

  const role = profile?.role ?? "user";
  const isAllowed = role === "admin" || role === "superadmin";
  if (!isAllowed) return { ok: false as const, status: 403, error: "forbidden" };

  return { ok: true as const, userId: user.id, role };
}

// GET /api/admin/objects/archive -> список архивных
export async function GET() {
  const guard = await requireAdminOrSuperadmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { data, error } = await supabaseAdmin
    .from("objects")
    .select("id,title,price,created_at,address,district,property_type,rooms,area_m2,floor,is_archived,archived_at")
    .eq("is_archived", true)
    .order("archived_at", { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}
