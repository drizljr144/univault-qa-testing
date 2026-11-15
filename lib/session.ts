import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
const COOKIE = "uvqa_admin";
const secret = () => process.env.SESSION_SECRET || "";
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || input.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}
export async function setAdminSession() {
  if (secret().length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  const value = "admin:" + Date.now();
  const jar = await cookies();
  jar.set(COOKIE, value + "." + sign(value), { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"strict", path:"/", maxAge:60*60*12 });
}
export async function isAdmin() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  if (i < 0) return false;
  const value = raw.slice(0,i), signature = raw.slice(i+1), expected = sign(value);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature),Buffer.from(expected)) && value.startsWith("admin:");
}
export async function clearAdminSession() { (await cookies()).delete(COOKIE); }