import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await import("@/lib/db");
    if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    const { briefs, visitors } = await import("@/drizzle/schema");
    const { desc } = await import("drizzle-orm");

    const [recentBriefs, recentVisitors] = await Promise.all([
      db.select().from(briefs).orderBy(desc(briefs.createdAt)).limit(100),
      db.select().from(visitors).orderBy(desc(visitors.createdAt)).limit(500),
    ]);

    return NextResponse.json({ briefs: recentBriefs, visitors: recentVisitors });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}