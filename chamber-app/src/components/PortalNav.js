import Link from "next/link";

export default function PortalNav({ current }) {
  const tabs = [
    ["/portal", "Dashboard"],
    ["/portal/profile", "Profile"],
    ["/portal/jobs", "Jobs"],
  ];
  return (
    <div className="topnav">
      <div className="wrap">
        <Link href="/" className="wordmark">
          <div className="seal serif">M</div>
          <div className="name">Member portal</div>
        </Link>
        <nav className="navlinks">
          {tabs.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={current === href ? { color: "var(--ink)", fontWeight: 600 } : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/" className="btn sm ghost">Public site</Link>
        </nav>
      </div>
    </div>
  );
}
