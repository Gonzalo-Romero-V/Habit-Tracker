import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/custom/ThemeProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Crea, programa y monitorea tus hábitos personales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", jakarta.variable, lora.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
