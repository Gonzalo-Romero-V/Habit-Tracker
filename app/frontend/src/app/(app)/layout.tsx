import { Aside } from "@/components/layout/aside";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/custom/AuthGuard";
import { CategoryFormProvider } from "@/components/custom/CategoryFormProvider";
import { HabitFormProvider } from "@/components/custom/HabitFormProvider";

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <CategoryFormProvider>
        <HabitFormProvider>
          <div className="flex min-h-dvh flex-col md:flex-row">
            <Aside />
            <div className="flex flex-1 flex-col">
              <Header />
              <main className="mx-auto w-full max-w-3xl flex-1 p-4 pb-24 md:pb-6">{children}</main>
            </div>
          </div>
        </HabitFormProvider>
      </CategoryFormProvider>
    </AuthGuard>
  );
}
