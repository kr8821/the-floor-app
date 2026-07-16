import Link from "next/link";
import { db } from "@/lib/db";
import { currentChamber } from "@/lib/tenant";
import SiteNav, { SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function Jobs() {
  const chamber = await currentChamber();
  const jobs = await db.job.findMany({
    where: { chamberId: chamber.id, status: "live" },
    include: { business: true },
    orderBy: { postedAt: "desc" },
  });

  return (
    <>
      <SiteNav chamber={chamber} current="/jobs" />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Job board</div>
          <h1 className="serif">Work for a {chamber.city} business.</h1>
          <p>
            {jobs.length} open positions at chamber member businesses. Members
            post free from the member portal; non-members can post for a fee.
          </p>
        </div>

        <div className="stack" style={{ paddingBottom: 40 }}>
          {jobs.map((j) => (
            <div className="card panel" key={j.id}>
              <div className="rowitem" style={{ border: "none", padding: 0 }}>
                <div>
                  <strong style={{ fontSize: 17 }}>{j.title}</strong>
                  <div className="muted">
                    <Link href={`/directory/${j.business.slug}`}>{j.business.name}</Link>
                    {" · "}{j.type.replace("_", "-")}
                    {j.payRange ? ` · ${j.payRange}` : ""}
                    {" · posted "}{j.postedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <p className="prose" style={{ margin: "8px 0 0", fontSize: 14 }}>{j.description}</p>
                </div>
                <a className="btn" href={j.applyUrl || `mailto:${j.applyEmail}`}>Apply</a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter chamber={chamber} />
    </>
  );
}
