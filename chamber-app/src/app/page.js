import Link from "next/link";
import { db } from "@/lib/db";
import { currentChamber } from "@/lib/tenant";
import SiteNav, { SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const chamber = await currentChamber();
  const [featured, jobs, events, memberCount] = await Promise.all([
    db.business.findMany({
      where: { chamberId: chamber.id, status: "active" },
      orderBy: [{ tier: "desc" }, { name: "asc" }],
      take: 3,
    }),
    db.job.findMany({
      where: { chamberId: chamber.id, status: "live" },
      include: { business: true },
      orderBy: { postedAt: "desc" },
      take: 3,
    }),
    db.event.findMany({
      where: { chamberId: chamber.id, status: "live", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    db.business.count({ where: { chamberId: chamber.id, status: "active" } }),
  ]);

  return (
    <>
      <SiteNav chamber={chamber} current="/" />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Welcome</div>
          <h1 className="serif">
            Shop, hire, and eat local in {chamber.city}.
          </h1>
          <p>
            {memberCount} local businesses belong to the {chamber.name}. Browse
            the directory, find a job, or see what&rsquo;s happening this month.
          </p>
          <div className="searchrow">
            <Link className="btn" href="/directory">Browse the directory</Link>
            <Link className="btn ghost" href="/jobs">See open jobs</Link>
          </div>
        </div>

        <div className="cols-2">
          <div className="stack">
            <div className="card panel">
              <h2>Featured members</h2>
              {featured.map((b) => (
                <div className="rowitem" key={b.id}>
                  <div>
                    <Link href={`/directory/${b.slug}`}><strong>{b.name}</strong></Link>
                    <div className="muted">{b.category} · {b.address}</div>
                  </div>
                  {b.tier === "featured" && <span className="badge featured">★ Featured</span>}
                </div>
              ))}
            </div>
            <div className="card panel">
              <h2>Latest jobs</h2>
              {jobs.map((j) => (
                <div className="rowitem" key={j.id}>
                  <div>
                    <strong>{j.title}</strong>
                    <div className="muted">{j.business.name}{j.payRange ? ` · ${j.payRange}` : ""}</div>
                  </div>
                  <Link className="btn sm ghost" href="/jobs">View</Link>
                </div>
              ))}
            </div>
          </div>
          <div className="card panel">
            <h2>Upcoming events</h2>
            {events.length === 0 && <p className="muted">Nothing scheduled yet.</p>}
            {events.map((e) => (
              <div className="rowitem" key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <div className="muted">
                    {e.startsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {e.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SiteFooter chamber={chamber} />
    </>
  );
}
