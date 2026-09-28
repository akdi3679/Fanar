import { createHmac, timingSafeEqual } from "crypto";

const SUFFIX = "__fanar_admin_session__";

export function makeAdminToken(expiry: number): string {
  const secret = (process.env.ADMIN_KEY || "") + SUFFIX;
  const hmac = createHmac("sha256", secret).update(String(expiry)).digest("hex");
  return expiry + "." + hmac;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [expiryStr, sig] = token.split(".");
  const expiry = Number(expiryStr);
  if (!expiry || expiry < Date.now()) return false;
  const expected = makeAdminToken(expiry).split(".")[1];
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function safeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
}