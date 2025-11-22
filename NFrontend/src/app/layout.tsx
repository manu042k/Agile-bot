import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "../components/layouts/MainLayout";
import { Providers } from "./providers";

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
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
