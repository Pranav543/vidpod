import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vidpod — Dynamic Ads",
  description: "Mark and preview dynamic ad placements in your podcast video",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
