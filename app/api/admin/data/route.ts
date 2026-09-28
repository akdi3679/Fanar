import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbModule = await import("@/lib/db").catch(() => null);
    if (!dbModule?.db) {
      return NextResponse.json({ error: "Database not configured. Set DATABASE_URL in Vercel env." }, { status: 503 });
    }

    const schema = await import("@/drizzle/schema");
    const { desc } = await import("drizzle-orm");

    const [briefs, visitors] = await Promise.all([
      dbModule.db.select().from(schema.briefs).orderBy(desc(schema.briefs.createdAt)).limit(100).catch(() => []),
      dbModule.db.select().from(schema.visitors).orderBy(desc(schema.visitors.createdAt)).limit(500).catch(() => []),
    ]);

    return NextResponse.json({ briefs, visitors });
  } catch (e) {
    console.error("Admin data error:", e);
    return NextResponse.json({ error: "Failed to load data", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}