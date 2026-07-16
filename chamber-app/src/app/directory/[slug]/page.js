import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentChamber } from "@/lib/tenant";
import SiteNav, { SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function BusinessProfile({ params }) {
  const { slug } = await params;
  const chamber = await currentChamber();
  const business = await db.business.findUnique({
    where: { chamberId_slug: { chamberId: chamber.id, slug } },
    include: {
      jobs: { where: { status: "live" }, orderBy: { postedAt: "desc" } },
      deals: { where: { status: "live" } },
    },
  });
  if (!business || business.status !== "active") notFound();

  // Every render is a directory impression — this row is what the member's
  // ROI dashboard counts.
  await db.profileView.create({
    data: { businessId: business.id, kind: "view" },
  });

  return (
    <>
      <SiteNav chamber={chamber} current="/directory" />
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "36px 0" }}>
        <div className="wrap" style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div
            className="serif"
            style={{
              width: 84, height: 84, borderRadius: 14, flex: "none",
              background: "var(--accent)", color: "var(--accent-ink)",
              display: "grid", placeItems: "center", fontSize: 34, fontWeight: 700,
            }}
          >
            {business.name[0]}
          </div>
          <div style={{ flex: "1 1 320px" }}>
            {business.tier === "featured" && (
              <span className="badge featured">★ Featured member</span>
            )}
            <h1 className="serif" style={{ fontSize: 32 }}>{business.name}</h1>
            <div className="muted" style={{ marginTop: 4 }}>
              {business.category} · Member since {business.joinedAt.getFullYear()} · {business.address}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              {business.website && <a className="btn" href={business.website}>Visit website</a>}
              {business.phone && <a className="btn ghost" href={`tel:${business.phone}`}>Call {business.phone}</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="cols-2">
          <div className="stack">
            <div className="card panel">
              <h2>About</h2>
              <p className="prose">{business.description}</p>
            </div>
            {business.jobs.length > 0 && (
              <div className="card panel">
                <h2>Open positions · {business.jobs.length}</h2>
                {business.jobs.map((j) => (
                  <div className="rowitem" key={j.id}>
                    <div>
                      <strong>{j.title}</strong>
                      <div className="muted">
                        {j.type.replace("_", "-")}{j.payRange ? ` · ${j.payRange}` : ""}
                      </div>
                    </div>
                    <a className="btn sm" href={j.applyUrl || `mailto:${j.applyEmail}`}>Apply</a>
                  </div>
                ))}
              </div>
            )}
            {business.deals.map((d) => (
              <div className="card panel" key={d.id}>
                <h2>Current deal</h2>
                <p className="prose"><strong>{d.title}.</strong> {d.description}</p>
              </div>
            ))}
          </div>
          <div className="stack">
            {business.hours && (
              <div className="card panel">
                <h2>Hours</h2>
                <p className="prose" style={{ fontSize: 14 }}>{business.hours}</p>
              </div>
            )}
            <div className="card panel">
              <h2>Contact</h2>
              <p className="prose" style={{ fontSize: 14 }}>
                {business.phone && <>{business.phone}<br /></>}
                {business.email && <>{business.email}<br /></>}
                {business.address}
              </p>
            </div>
            <div className="card panel">
              <h2>More in {business.category}</h2>
              <Link href={`/directory?category=${encodeURIComponent(business.category)}`}>
                Browse {business.category} members →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter chamber={chamber} />
    </>
  );
}
