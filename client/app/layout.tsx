import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acadlyst ", 
  description: "your personalized AI academic copilot.", 
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' }, 
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png', 
    shortcut: '/apple-touch-icon.png', 
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
      },
      {
        rel: 'mask-icon', 
        url: '/safari-pinned-tab.svg',
        color: '#E23B6D', 
      },
    ],
  },
  manifest: '/site.webmanifest', 
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}