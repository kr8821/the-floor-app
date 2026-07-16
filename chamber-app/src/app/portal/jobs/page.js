import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import PortalNav from "@/components/PortalNav";

export const dynamic = "force-dynamic";

export default async function PortalJobs() {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");
  const business = session.business;

  const jobs = await db.job.findMany({
    where: { businessId: business.id },
    orderBy: { postedAt: "desc" },
  });

  async function postJob(formData) {
    "use server";
    const current = await getSession();
    if (!current || current.role !== "member") redirect("/login");
    await db.job.create({
      data: {
        chamberId: current.business.chamberId,
        businessId: current.businessId,
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
        payRange: formData.get("payRange") || null,
        applyEmail: formData.get("applyEmail"),
        // New posts wait in the chamber's approval queue.
        status: "pending",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    revalidatePath("/portal/jobs");
    redirect("/portal/jobs");
  }

  return (
    <>
      <PortalNav current="/portal/jobs" />
      <div className="wrap">
        <div className="hero" style={{ paddingBottom: 10 }}>
          <h1 style={{ fontSize: 26 }}>Job posts</h1>
          <p>Posting is free for members. New posts are reviewed by chamber staff, usually within a day.</p>
        </div>
        <div className="cols-2" style={{ paddingBottom: 40 }}>
          <form action={postJob} className="card panel formgrid">
            <h2>Post a new job</h2>
            <label>
              Title
              <input name="title" required placeholder="Barista — weekends" />
            </label>
            <label>
              Description
              <textarea name="description" rows={4} required />
            </label>
            <label>
              Type
              <select name="type">
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </label>
            <label>
              Pay range (optional)
              <input name="payRange" placeholder="$18–22/hr" />
            </label>
            <label>
              Where should applications go?
              <input name="applyEmail" type="email" required placeholder="jobs@yourbusiness.com" />
            </label>
            <div>
              <button className="btn" type="submit">Submit for review</button>
            </div>
          </form>
          <div className="card panel">
            <h2>Your posts</h2>
            {jobs.length === 0 && <p className="muted">No job posts yet.</p>}
            {jobs.map((j) => (
              <div className="rowitem" key={j.id}>
                <div>
                  <strong>{j.title}</strong>
                  <div className="muted">{j.applicantCount} applicants</div>
                </div>
                <span className={`badge ${j.status === "live" ? "good" : "warn"}`}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
