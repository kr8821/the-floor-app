import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentChamber } from "@/lib/tenant";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default async function AdminOverview() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const chamber = await currentChamber();
  const soon = new Date(Date.now() + THIRTY_DAYS);

  const [memberCount, renewingSoon, pendingJobs, pendingEvents, liveJobCount] =
    await Promise.all([
      db.business.count({ where: { chamberId: chamber.id, status: "active" } }),
      db.business.findMany({
        where: { chamberId: chamber.id, status: "active", renewsAt: { lte: soon } },
        orderBy: { renewsAt: "asc" },
      }),
      db.job.findMany({
        where: { chamberId: chamber.id, status: "pending" },
        include: { business: true },
      }),
      db.event.findMany({ where: { chamberId: chamber.id, status: "pending" } }),
      db.job.count({ where: { chamberId: chamber.id, status: "live" } }),
    ]);

  // At-risk = renewal inside 30 days AND no directory activity in 60 days.
  const atRisk = [];
  for (const b of renewingSoon) {
    const recentViews = await db.profileView.count({
      where: {
        businessId: b.id,
        occurredAt: { gte: new Date(Date.now() - 2 * THIRTY_DAYS) },
      },
    });
    if (recentViews < 10) atRisk.push({ ...b, recentViews });
  }

  async function approveJob(formData) {
    "use server";
    const s = await getSession();
    if (!s || s.role !== "admin") redirect("/login");
    await db.job.update({
      where: { id: formData.get("id") },
      data: { status: "live" },
    });
    revalidatePath("/admin");
  }

  async function approveEvent(formData) {
    "use server";
    const s = await getSession();
    if (!s || s.role !== "admin") redirect("/login");
    await db.event.update({
      where: { id: formData.get("id") },
      data: { status: "live" },
    });
    revalidatePath("/admin");
  }

  const pendingCount = pendingJobs.length + pendingEvents.length;

  return (
    <div className="wrap">
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="eyebrow">{chamber.name} · Admin</div>
        <h1 style={{ fontSize: 26 }}>Good morning, {session.name}</h1>
        <p>
          {memberCount} active members · {pendingCount} item{pendingCount === 1 ? "" : "s"} awaiting approval ·{" "}
          <a href="/">view public site</a>
        </p>
      </div>

      <div className="tiles">
        <div className="card tile">
          <div className="k">Active members</div>
          <div className="v">{memberCount}</div>
        </div>
        <div className="card tile">
          <div className="k">Renewals next 30 days</div>
          <div className="v">{renewingSoon.length}</div>
        </div>
        <div className="card tile">
          <div className="k">At-risk members</div>
          <div className="v">{atRisk.length}</div>
          <div className="d">low activity + renewal soon</div>
        </div>
        <div className="card tile">
          <div className="k">Live job posts</div>
          <div className="v">{liveJobCount}</div>
        </div>
      </div>

      {atRisk.length > 0 && (
        <div className="card panel">
          <h2>At-risk: call before they lapse</h2>
          <div className="tablewrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Renews</th>
                  <th className="num">Views (60d)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.name}</strong></td>
                    <td>{b.renewsAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td className="num">{b.recentViews}</td>
                    <td><span className="badge crit">High risk</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card panel" style={{ margin: "18px 0 40px" }}>
        <h2>Approval queue</h2>
        {pendingCount === 0 && <p className="muted">Queue is clear. Nice.</p>}
        {pendingJobs.map((j) => (
          <div className="rowitem" key={j.id}>
            <div>
              Job: &ldquo;{j.title}&rdquo; — {j.business.name}
              <div className="muted">
                submitted {j.postedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
            <form action={approveJob}>
              <input type="hidden" name="id" value={j.id} />
              <button className="btn sm" type="submit">Approve</button>
            </form>
          </div>
        ))}
        {pendingEvents.map((e) => (
          <div className="rowitem" key={e.id}>
            <div>
              Event: &ldquo;{e.title}&rdquo;
              <div className="muted">{e.location}</div>
            </div>
            <form action={approveEvent}>
              <input type="hidden" name="id" value={e.id} />
              <button className="btn sm" type="submit">Approve</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
