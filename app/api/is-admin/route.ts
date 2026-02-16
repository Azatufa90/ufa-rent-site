import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  // 1) текущий пользователь
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json(
      { isAdmin: false, reason: "no-user" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const userId = userData.user.id;

  // 2) проверяем в таблице admins по колонке user_id
  const { data: adminRow, error: adminErr } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminErr) {
    return NextResponse.json(
      { isAdmin: false, reason: adminErr.message },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { isAdmin: !!adminRow, via: "admins.user_id" },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
