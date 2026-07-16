import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import PortalNav from "@/components/PortalNav";

export const dynamic = "force-dynamic";

const monthStart = (offset) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - offset, 1);
};

export default async function PortalDashboard() {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");
  const business = session.business;

  const [viewsThisMonth, viewsLastMonth, clicksThisMonth, jobs] = await Promise.all([
    db.profileView.count({
      where: { businessId: business.id, kind: "view", occurredAt: { gte: monthStart(0) } },
    }),
    db.profileView.count({
      where: {
        businessId: business.id,
        kind: "view",
        occurredAt: { gte: monthStart(1), lt: monthStart(0) },
      },
    }),
    db.profileView.count({
      where: {
        businessId: business.id,
        kind: { startsWith: "click" },
        occurredAt: { gte: monthStart(0) },
      },
    }),
    db.job.findMany({
      where: { businessId: business.id },
      orderBy: { postedAt: "desc" },
    }),
  ]);

  // Monthly view counts for the last six months, oldest first.
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const count = await db.profileView.count({
      where: {
        businessId: business.id,
        kind: "view",
        occurredAt: { gte: monthStart(i), lt: monthStart(i - 1) },
      },
    });
    monthly.push({
      label: monthStart(i).toLocaleDateString("en-US", { month: "short" }),
      count,
    });
  }
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);

  const applicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);
  const liveJobs = jobs.filter((j) => j.status === "live");
  const delta =
    viewsLastMonth > 0
      ? Math.round(((viewsThisMonth - viewsLastMonth) / viewsLastMonth) * 100)
      : null;

  return (
    <>
      <PortalNav current="/portal" />
      <div className="wrap">
        <div className="hero" style={{ paddingBottom: 8 }}>
          <h1 style={{ fontSize: 26 }}>{business.name}</h1>
          <div className="note">
            <span className="badge good">Membership active</span>
            <span>
              {business.renewsAt && (
                <>Renews <strong>{business.renewsAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong> · </>
              )}
              {business.tier === "featured"
                ? "Featured tier — your listing appears first in directory searches."
                : "Basic tier — upgrade to Featured to appear first in searches."}
            </span>
          </div>
        </div>

        <div className="tiles">
          <div className="card tile">
            <div className="k">Profile views</div>
            <div className="v">{viewsThisMonth}</div>
            {delta !== null && (
              <div className={`d${delta >= 0 ? " up" : ""}`}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month
              </div>
            )}
          </div>
          <div className="card tile">
            <div className="k">Website + call clicks</div>
            <div className="v">{clicksThisMonth}</div>
            <div className="d">this month</div>
          </div>
          <div className="card tile">
            <div className="k">Job applicants</div>
            <div className="v">{applicants}</div>
            <div className="d">{liveJobs.length} role{liveJobs.length === 1 ? "" : "s"} open</div>
          </div>
        </div>

        <div className="card panel">
          <h2>Profile views — last 6 months</h2>
          <p className="muted" style={{ margin: "0 0 14px", fontSize: 13 }}>
            This is what your membership earned.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${monthly.length}, 1fr)`,
              gap: 14,
              alignItems: "end",
              height: 170,
            }}
            role="img"
            aria-label={`Monthly profile views: ${monthly.map((m) => `${m.label} ${m.count}`).join(", ")}`}
          >
            {monthly.map((m, i) => (
              <div key={m.label} style={{ display: "grid", gap: 6, alignContent: "end", height: "100%" }}>
                {i === monthly.length - 1 && (
                  <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13 }}>{m.count}</div>
                )}
                <div
                  style={{
                    background: "var(--chart)",
                    borderRadius: "4px 4px 0 0",
                    height: `${Math.max((m.count / maxCount) * 120, 2)}px`,
                  }}
                  title={`${m.label}: ${m.count} views`}
                />
                <div style={{ textAlign: "center", fontSize: 12, color: "var(--ink-2)" }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel" style={{ margin: "18px 0 40px" }}>
          <h2>Your job posts</h2>
          {jobs.length === 0 && <p className="muted">No job posts yet.</p>}
          {jobs.map((j) => (
            <div className="rowitem" key={j.id}>
              <div>
                <strong>{j.title}</strong>
                <div className="muted">
                  {j.applicantCount} applicant{j.applicantCount === 1 ? "" : "s"}
                  {j.expiresAt && j.status === "live"
                    ? ` · expires ${j.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : ""}
                </div>
              </div>
              <span className={`badge ${j.status === "live" ? "good" : j.status === "pending" ? "warn" : "warn"}`}>
                {j.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
