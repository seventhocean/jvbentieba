import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "剧本圈 - 剧本杀爱好者社区",
  description: "剧本杀玩家和DM的交流社区，分享体验，发现好局。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen pt-16">{children}</main>
          <Toaster theme="dark" position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
