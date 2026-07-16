import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import PortalNav from "@/components/PortalNav";

export const dynamic = "force-dynamic";

export default async function EditProfile() {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");
  const business = session.business;

  async function save(formData) {
    "use server";
    const current = await getSession();
    if (!current || current.role !== "member") redirect("/login");
    await db.business.update({
      where: { id: current.businessId },
      data: {
        description: formData.get("description"),
        phone: formData.get("phone") || null,
        website: formData.get("website") || null,
        email: formData.get("email") || null,
        hours: formData.get("hours") || null,
      },
    });
    revalidatePath("/directory");
    redirect("/portal/profile?saved=1");
  }

  return (
    <>
      <PortalNav current="/portal/profile" />
      <div className="wrap">
        <div className="hero" style={{ paddingBottom: 10 }}>
          <h1 style={{ fontSize: 26 }}>Edit your public profile</h1>
          <p>Changes go live on the directory immediately.</p>
        </div>
        <form action={save} className="card panel formgrid" style={{ marginBottom: 40 }}>
          <label>
            About your business
            <textarea name="description" rows={5} defaultValue={business.description} required />
          </label>
          <label>
            Phone
            <input name="phone" defaultValue={business.phone ?? ""} />
          </label>
          <label>
            Website
            <input name="website" type="url" defaultValue={business.website ?? ""} placeholder="https://…" />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={business.email ?? ""} />
          </label>
          <label>
            Hours
            <input name="hours" defaultValue={business.hours ?? ""} placeholder="Mon–Fri 9am–5pm" />
          </label>
          <div>
            <button className="btn" type="submit">Save changes</button>
          </div>
        </form>
      </div>
    </>
  );
}
