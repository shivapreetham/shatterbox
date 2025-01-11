// app/layout.tsx
import type { Metadata } from "next";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import ActiveStatus from "@/components/chat/ActiveStatus";
import Navbar from "@/components/home&anonymous/Navbar";
export const metadata: Metadata = {
  title: "ShadowME",
  description: "shadow someone like a tree",
  icons: {
    icon: "/image.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background min-h-screen">
        <AuthProvider>
          {/* <PusherProvider> */}
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ActiveStatus />
              {children}
              <Toaster />
            </ThemeProvider>
          {/* </PusherProvider> */}
        </AuthProvider>
      </body>
    </html>
  );
}