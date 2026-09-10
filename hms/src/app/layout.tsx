import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "GEC Munger - Hostel Management System | राजकीय अभियंत्रण महाविद्यालय, मुंगेर",
  description: "Government Engineering College, Munger - Comprehensive Hostel Management System (HMS Portal). Digital room allocation, attendance, mess rebate and student resident services.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="image"
          href="/landing_page_image.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          precedence="default"
        />
      </head>
      <body className="antialiased bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between selection:bg-blue-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
