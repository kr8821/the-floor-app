import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentChamber } from "@/lib/tenant";
import { setSession } from "@/lib/auth";
import SiteNav, { SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

// Demo sign-in: pick a role. Production replaces this page with email magic
// links — the session shape stays identical.
export default async function Login() {
  const chamber = await currentChamber();
  const businesses = await db.business.findMany({
    where: { chamberId: chamber.id, status: "active" },
    orderBy: { name: "asc" },
  });

  async function signIn(formData) {
    "use server";
    const role = formData.get("role");
    if (role === "admin") {
      await setSession({ role: "admin", name: "Dana" });
      redirect("/admin");
    }
    await setSession({ role: "member", businessId: formData.get("businessId") });
    redirect("/portal");
  }

  return (
    <>
      <SiteNav chamber={chamber} />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Demo sign-in</div>
          <h1 className="serif">Who are you today?</h1>
          <p>This scaffold uses a demo picker; production uses email magic links.</p>
        </div>
        <div className="cols-2" style={{ paddingBottom: 40 }}>
          <form action={signIn} className="card panel formgrid">
            <h2>Sign in as a member business</h2>
            <input type="hidden" name="role" value="member" />
            <label>
              Business
              <select name="businessId">
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <button className="btn" type="submit">Open member portal</button>
          </form>
          <form action={signIn} className="card panel formgrid">
            <h2>Sign in as chamber staff</h2>
            <input type="hidden" name="role" value="admin" />
            <button className="btn" type="submit">Open chamber admin</button>
          </form>
        </div>
      </div>
      <SiteFooter chamber={chamber} />
    </>
  );
}
