import Link from "next/link";

export function AsideMobile() {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex items-center justify-around border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <Link href="/habits" className="flex-1 py-3 text-center text-sm">
        Hábitos
      </Link>
      <Link href="/categories" className="flex-1 py-3 text-center text-sm">
        Categorías
      </Link>
    </nav>
  );
}
