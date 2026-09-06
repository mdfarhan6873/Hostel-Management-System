import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CampusHMS - Modern Hostel Management System",
  description:
    "Next-generation collegiate hostel management system with live capacity matrix, 1-click room allotment, nightly selfie attendance, mess rebates, and UPI billing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
