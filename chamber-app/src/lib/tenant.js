import { db } from "./db";

// Multi-tenant resolution. In production each chamber lives on a subdomain
// (maplewood.mainstreet.app) or custom domain; the host header picks the
// tenant. In dev, CHAMBER_SLUG (or the first chamber) is used.
export async function currentChamber() {
  const slug = process.env.CHAMBER_SLUG;
  const chamber = slug
    ? await db.chamber.findUnique({ where: { slug } })
    : await db.chamber.findFirst();
  if (!chamber) throw new Error("No chamber found — run `npm run setup` to seed.");
  return chamber;
}
