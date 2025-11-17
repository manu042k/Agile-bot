import type { Metadata } from "next";
import "./globals.css";
import NavBarComponent from "../components/common/NavBarComponent";

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
        <NavBarComponent />
        <main>{children}</main>
      </body>
    </html>
  );
}
