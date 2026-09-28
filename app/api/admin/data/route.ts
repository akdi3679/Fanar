import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { briefs, visitors } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ error: "Database not configured. Check DATABASE_URL in Vercel env." }, { status: 503 });
  }
  try {
    const [recentBriefs, recentVisitors] = await Promise.all([
      db.select().from(briefs).orderBy(desc(briefs.createdAt)).limit(100),
      db.select().from(visitors).orderBy(desc(visitors.createdAt)).limit(500),
    ]);
    return NextResponse.json({ briefs: recentBriefs, visitors: recentVisitors });
  } catch (e) {
    console.error("Admin data error:", e);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}