import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Ads — Practice Simulator",
  description:
    "A password-protected training sandbox for building a Google Search campaign, with a mock Keyword Planner. Nothing connects to Google or can be published.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
