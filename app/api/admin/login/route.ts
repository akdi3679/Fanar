import { NextRequest, NextResponse } from "next/server";
import { makeAdminToken, safeCompare } from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;        // 5 minutes
const SESSION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return NextResponse.json({ error: "Admin not configured" }, { status: 500 });

  const ip = getIp(req);
  const now = Date.now();
  const rec = attempts.get(ip);

  if (rec && rec.lockedUntil > now) {
    const retryAfter = Math.ceil((rec.lockedUntil - now) / 1000);
    return NextResponse.json(
      { error: `Too many attempts. Blocked for ${retryAfter}s.`, retryAfter, attemptsLeft: 0 },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";

  if (safeCompare(code, adminKey)) {
    attempts.delete(ip);
    const token = makeAdminToken(now + SESSION_MS);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MS / 1000,
    });
    return res;
  }

  const count = (rec?.count || 0) + 1;
  if (count >= MAX_ATTEMPTS) {
    attempts.set(ip, { count: 0, lockedUntil: now + LOCK_MS });
    return NextResponse.json(
      { error: "Too many attempts. Blocked for 5 minutes.", retryAfter: LOCK_MS / 1000, attemptsLeft: 0 },
      { status: 429 }
    );
  }
  attempts.set(ip, { count, lockedUntil: 0 });
  return NextResponse.json(
    { error: "Wrong code.", attemptsLeft: MAX_ATTEMPTS - count },
    { status: 401 }
  );
}