import "./globals.css";
import { appDisclaimer } from "@/lib/disclaimer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto max-w-[1400px] p-6">{children}</main>
        <footer className="border-t bg-white p-4 text-center text-xs text-slate-600">{appDisclaimer}</footer>
      </body>
    </html>
  );
}
