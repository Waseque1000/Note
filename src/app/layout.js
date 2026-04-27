import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Notepad | Pure & Minimal",
  description: "A beautiful, white-themed minimalist notepad.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-white transition-colors font-sans"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        suppressHydrationWarning
      >
        <Providers>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
