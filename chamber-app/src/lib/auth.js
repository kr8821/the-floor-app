import { cookies } from "next/headers";
import { db } from "./db";

// Demo auth: a cookie holds the role and (for members) the businessId.
// Production replaces this with email magic links; the call sites stay the same.
const COOKIE = "mainstreet_session";

export async function getSession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (session.role === "member" && session.businessId) {
      const business = await db.business.findUnique({
        where: { id: session.businessId },
      });
      if (!business) return null;
      return { ...session, business };
    }
    return session;
  } catch {
    return null;
  }
}

export async function setSession(session) {
  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(session), { httpOnly: true, path: "/" });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
