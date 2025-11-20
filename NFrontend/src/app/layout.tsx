import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "../components/layouts/MainLayout";

export const metadata: Metadata = {
  title: "Agile Bot",
  description: "Agile Bot for project management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
