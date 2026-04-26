import type { Metadata } from "next";
import { Cinzel_Decorative, DM_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  style: ["italic", "normal"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "SYNÆSTHESIA | If sound were visible, it would look like this.",
  description: "A cinematic, full-screen music visualizer. Experience your music in a bioluminescent void.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${cinzel.variable} ${dmMono.variable} ${cormorant.variable} bg-void text-primary selection:bg-neon-violet/30 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
