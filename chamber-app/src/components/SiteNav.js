import Link from "next/link";

export default function SiteNav({ chamber, current }) {
  const links = [
    ["/directory", "Directory"],
    ["/jobs", "Jobs"],
    ["/events", "Events"],
  ];
  return (
    <div className="topnav">
      <div className="wrap">
        <Link href="/" className="wordmark">
          <div className="seal serif">{chamber.name[0]}</div>
          <div>
            <div className="name serif">{chamber.name}</div>
            <div className="sub">
              {chamber.city}, {chamber.state}
            </div>
          </div>
        </Link>
        <nav className="navlinks">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={current === href ? { color: "var(--ink)", fontWeight: 600 } : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/portal" className="btn sm">
            Member portal
          </Link>
        </nav>
      </div>
    </div>
  );
}

export function SiteFooter({ chamber }) {
  return (
    <footer className="site">
      <div className="wrap">
        <span>© 2026 {chamber.name}</span>
        <span>Powered by Mainstreet</span>
      </div>
    </footer>
  );
}
