import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "¡Vamos! — Spontaneous Connection",
  description:
    "A low-friction social presence app. See what your people are up to and join spontaneously.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
