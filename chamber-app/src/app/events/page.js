import { db } from "@/lib/db";
import { currentChamber } from "@/lib/tenant";
import SiteNav, { SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function Events() {
  const chamber = await currentChamber();
  const events = await db.event.findMany({
    where: { chamberId: chamber.id, status: "live", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <>
      <SiteNav chamber={chamber} current="/events" />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Community calendar</div>
          <h1 className="serif">What&rsquo;s happening in {chamber.city}.</h1>
          <p>Chamber events plus member-submitted community events.</p>
        </div>
        <div className="stack" style={{ paddingBottom: 40 }}>
          {events.length === 0 && <p className="muted">Nothing scheduled — check back soon.</p>}
          {events.map((e) => (
            <div className="card panel" key={e.id}>
              <div className="rowitem" style={{ border: "none", padding: 0 }}>
                <div>
                  <strong style={{ fontSize: 17 }}>{e.title}</strong>
                  <div className="muted">
                    {e.startsAt.toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    })}{" "}
                    · {e.location}
                  </div>
                  <p className="prose" style={{ margin: "8px 0 0", fontSize: 14 }}>{e.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter chamber={chamber} />
    </>
  );
}
