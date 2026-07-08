import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";

export async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}
