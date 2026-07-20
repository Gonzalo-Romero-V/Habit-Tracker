import Link from "next/link";

export function AsideDesktop() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border bg-background p-3 md:flex">
      <Link href="/habits" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
        Hábitos
      </Link>
      <Link href="/categories" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
        Categorías
      </Link>
    </aside>
  );
}
