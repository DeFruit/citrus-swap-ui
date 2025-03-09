import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LoadingContextProvider } from "./context/loading";
import { WalletContextProvider } from "./context/wallet";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Citrus Swap",
  description: "The juiciest DEX on the ALGO! 🍊", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LoadingContextProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
          </LoadingContextProvider>
        </Providers>
      </body>
    </html>
  );
}
