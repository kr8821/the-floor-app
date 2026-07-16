import "./globals.css";

export const metadata = {
  title: "Mainstreet — chamber platform",
  description: "Member-first chamber of commerce software.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
