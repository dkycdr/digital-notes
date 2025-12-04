import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dwiky's Digital Notes - Personal PDF Manager",
  description: "Upload, view, and manage your PDF lecture notes in one place. Perfect for your personal study collection.",
  keywords: ["Digital Notes", "PDF", "Lecture Notes", "Education", "Students", "Study", "Personal"],
  authors: [{ name: "Author" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Dwiky's Digital Notes - Personal PDF Manager",
    description: "Upload, view, and manage your PDF lecture notes in one place - your personal collection",
    url: "https://chat.z.ai",
    siteName: "Dwiky's Digital Notes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dwiky's Digital Notes - Personal PDF Manager",
    description: "Upload, view, and manage your PDF lecture notes in one place - your personal collection",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
