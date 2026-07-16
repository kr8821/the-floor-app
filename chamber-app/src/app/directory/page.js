import Link from "next/link";
import { db } from "@/lib/db";
import { currentChamber } from "@/lib/tenant";
import SiteNav, { SiteFooter } from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export default async function Directory({ searchParams }) {
  const { q = "", category = "" } = await searchParams;
  const chamber = await currentChamber();

  const where = {
    chamberId: chamber.id,
    status: "active",
    ...(category ? { category } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
  };

  const [businesses, categories, total] = await Promise.all([
    db.business.findMany({ where, orderBy: [{ tier: "desc" }, { name: "asc" }] }),
    db.business.groupBy({
      by: ["category"],
      where: { chamberId: chamber.id, status: "active" },
      _count: true,
      orderBy: { category: "asc" },
    }),
    db.business.count({ where: { chamberId: chamber.id, status: "active" } }),
  ]);

  return (
    <>
      <SiteNav chamber={chamber} current="/directory" />
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Business directory</div>
          <h1 className="serif">Every business here backs {chamber.city}.</h1>
          <p>
            {total} chamber members. Search by name or browse by category.
          </p>
          <form className="searchrow" action="/directory">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search businesses — try “coffee” or “books”"
              aria-label="Search businesses"
            />
            <button className="btn" type="submit">Search</button>
          </form>
        </div>

        <nav className="chips" aria-label="Categories">
          <Link className={`chip${!category ? " on" : ""}`} href="/directory">
            All ({total})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              className={`chip${category === c.category ? " on" : ""}`}
              href={`/directory?category=${encodeURIComponent(c.category)}`}
            >
              {c.category} ({c._count})
            </Link>
          ))}
        </nav>

        <div className="bizgrid">
          {businesses.length === 0 && (
            <p className="muted">No businesses match &ldquo;{q}&rdquo;.</p>
          )}
          {businesses.map((b) => (
            <Link href={`/directory/${b.slug}`} className="card biz" key={b.id}>
              <div className="photo serif">{b.name[0]}</div>
              <div className="body">
                {b.tier === "featured" && (
                  <span className="badge featured">★ Featured member</span>
                )}
                <div className="cat">{b.category}</div>
                <h3 className="serif">{b.name}</h3>
                <p>{b.description.slice(0, 110)}{b.description.length > 110 ? "…" : ""}</p>
                <div className="meta">{b.address}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter chamber={chamber} />
    </>
  );
}
