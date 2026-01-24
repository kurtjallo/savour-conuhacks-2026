import type { Metadata } from "next";
import "./globals.css";
import { BasketProvider } from "@/context/BasketContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "InflationFighter - Save on Groceries",
  description: "Compare grocery prices across 5 Canadian stores. Save up to 30% on your weekly shop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <BasketProvider>
          <Header />
          <main>{children}</main>
        </BasketProvider>
      </body>
    </html>
  );
}
