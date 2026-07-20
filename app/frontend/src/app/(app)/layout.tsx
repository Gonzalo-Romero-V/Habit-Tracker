import { Aside } from "@/components/layout/aside";
import { Header } from "@/components/layout/header";

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Aside />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 pb-20 md:pb-4">{children}</main>
      </div>
    </div>
  );
}
