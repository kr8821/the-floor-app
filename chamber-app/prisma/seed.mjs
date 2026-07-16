import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  await db.profileView.deleteMany();
  await db.job.deleteMany();
  await db.deal.deleteMany();
  await db.event.deleteMany();
  await db.business.deleteMany();
  await db.chamber.deleteMany();

  const chamber = await db.chamber.create({
    data: {
      slug: "maplewood",
      name: "Maplewood Chamber of Commerce",
      city: "Maplewood",
      state: "MI",
    },
  });

  const businesses = [
    {
      slug: "harbor-coffee-roasters",
      name: "Harbor Coffee Roasters",
      category: "Food & Drink",
      description:
        "Small-batch roaster and café on the square. We roast in eight-pound batches twice a week and offer wholesale pricing for local restaurants and offices.",
      address: "112 Main St",
      phone: "(231) 555-0142",
      website: "https://harborcoffee.example",
      email: "hello@harborcoffee.example",
      hours: "Mon–Fri 6:30am–6pm · Sat 7am–6pm · Sun 8am–2pm",
      tier: "featured",
      renewsAt: daysFromNow(88),
    },
    {
      slug: "maplewood-hardware",
      name: "Maplewood Hardware & Supply",
      category: "Home Services",
      description:
        "Family-owned since 1962. Tool rental, paint matching, and same-day screen repair.",
      address: "48 Cedar Ave",
      phone: "(231) 555-0177",
      hours: "Mon–Sat 7am–7pm · Sun 9am–4pm",
      renewsAt: daysFromNow(150),
    },
    {
      slug: "cedar-and-salt",
      name: "Cedar & Salt",
      category: "Food & Drink",
      description:
        "Seasonal dinner menu built around Michigan farms. Private room seats 30.",
      address: "9 Bridge St",
      phone: "(231) 555-0198",
      hours: "Tue–Sun 5pm–10pm",
      renewsAt: daysFromNow(200),
    },
    {
      slug: "birchwood-family-dental",
      name: "Birchwood Family Dental",
      category: "Health",
      description:
        "Accepting new patients. Evening appointments Tuesday and Thursday.",
      address: "310 Lake Rd",
      phone: "(231) 555-0111",
      renewsAt: daysFromNow(45),
    },
    {
      slug: "lakeview-realty",
      name: "Lakeview Realty Group",
      category: "Professional",
      description:
        "Residential and lakefront specialists. Free market analysis for chamber members.",
      address: "77 Main St, Suite 2",
      phone: "(231) 555-0155",
      renewsAt: daysFromNow(300),
    },
    {
      slug: "north-branch-books",
      name: "North Branch Books",
      category: "Retail",
      description:
        "New and used books, local authors shelf, and a Saturday story hour for kids.",
      address: "15 Bridge St",
      phone: "(231) 555-0129",
      renewsAt: daysFromNow(120),
    },
    {
      slug: "riverside-auto-body",
      name: "Riverside Auto Body",
      category: "Home Services",
      description: "Collision repair and detailing. Free estimates.",
      address: "402 River Rd",
      renewsAt: daysFromNow(17), // renewal soon + no activity → at-risk demo
    },
  ];

  const created = {};
  for (const b of businesses) {
    created[b.slug] = await db.business.create({
      data: { ...b, chamberId: chamber.id },
    });
  }

  const harbor = created["harbor-coffee-roasters"];

  await db.job.createMany({
    data: [
      {
        chamberId: chamber.id,
        businessId: harbor.id,
        title: "Barista — weekends",
        description:
          "Part-time weekend barista. Espresso experience a plus, training provided.",
        type: "part_time",
        payRange: "$15–17/hr + tips",
        applyEmail: "jobs@harborcoffee.example",
        status: "live",
        applicantCount: 4,
        postedAt: daysAgo(3),
        expiresAt: daysFromNow(14),
      },
      {
        chamberId: chamber.id,
        businessId: harbor.id,
        title: "Wholesale delivery driver",
        description: "Tuesday and Friday morning routes. Clean driving record required.",
        type: "part_time",
        applyEmail: "jobs@harborcoffee.example",
        status: "live",
        applicantCount: 2,
        postedAt: daysAgo(7),
        expiresAt: daysFromNow(21),
      },
      {
        chamberId: chamber.id,
        businessId: created["cedar-and-salt"].id,
        title: "Line cook",
        description: "Full-time line cook, dinner service. Two years experience preferred.",
        type: "full_time",
        payRange: "$20–24/hr",
        applyEmail: "kitchen@cedarandsalt.example",
        status: "pending", // sits in the admin approval queue
        postedAt: daysAgo(0),
      },
      {
        chamberId: chamber.id,
        businessId: created["birchwood-family-dental"].id,
        title: "Dental hygienist",
        description: "Full-time hygienist, four-day week. Signing bonus.",
        type: "full_time",
        payRange: "$38–44/hr",
        applyEmail: "office@birchwooddental.example",
        status: "live",
        applicantCount: 1,
        postedAt: daysAgo(10),
        expiresAt: daysFromNow(30),
      },
    ],
  });

  await db.deal.create({
    data: {
      chamberId: chamber.id,
      businessId: harbor.id,
      title: "Chamber Tuesday: 10% off whole-bean bags",
      description:
        "Show any Maplewood member badge for 10% off whole-bean bags, every Tuesday through September.",
      status: "live",
      endsAt: daysFromNow(75),
    },
  });

  await db.event.createMany({
    data: [
      {
        chamberId: chamber.id,
        title: "Business After Hours",
        description: "Monthly networking mixer. Appetizers by the host venue.",
        location: "Cedar & Salt, 9 Bridge St",
        startsAt: daysFromNow(8),
        status: "live",
      },
      {
        chamberId: chamber.id,
        title: "Sidewalk Sale Weekend",
        description: "Downtown-wide sidewalk sale hosted by North Branch Books.",
        location: "Bridge St",
        startsAt: daysFromNow(18),
        status: "pending",
        submittedBy: created["north-branch-books"].id,
      },
    ],
  });

  // Six months of profile views for Harbor Coffee so the ROI dashboard has a story.
  const monthlyViews = [248, 265, 301, 322, 349, 412];
  const viewRows = [];
  monthlyViews.forEach((count, monthIdx) => {
    const monthsBack = monthlyViews.length - 1 - monthIdx;
    for (let i = 0; i < count; i++) {
      viewRows.push({
        businessId: harbor.id,
        kind: i % 11 === 0 ? "click_website" : "view",
        occurredAt: daysAgo(monthsBack * 30 + (i % 28)),
      });
    }
  });
  // Insert in chunks to keep SQLite happy.
  for (let i = 0; i < viewRows.length; i += 500) {
    await db.profileView.createMany({ data: viewRows.slice(i, i + 500) });
  }

  console.log(
    `Seeded: 1 chamber, ${businesses.length} businesses, 4 jobs, 2 events, ${viewRows.length} analytics rows`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
