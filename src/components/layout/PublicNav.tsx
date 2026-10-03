import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

const links = [
  { href: "/paket/umrah", label: "Umrah" },
  { href: "/paket/haji", label: "Haji" },
  { href: "/paket/halal_tour", label: "Halal Tour" },
  { href: "/paket/tour", label: "Tour" },
  { href: "/segadeals", label: "SegaDeals" },
];

export async function PublicNav() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center" aria-label="Segaloka">
          <img
            src="/brand/segaloka-logo.png"
            alt="Segaloka"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <nav className="hidden flex-1 items-center gap-5 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-text-secondary hover:text-text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link href="/akun" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
              Akun Saya
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-text-primary hover:bg-bg">
                Masuk
              </Link>
              <Link href="/register" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center">
            <img
              src="/brand/segaloka-logo.png"
              alt="Segaloka"
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="mt-3 text-sm text-text-secondary">Ekosistem digital Umrah, Haji, dan Halal Tour Indonesia.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Produk</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link href="/paket/umrah" className="hover:text-text-primary">Umrah</Link></li>
            <li><Link href="/paket/haji" className="hover:text-text-primary">Haji</Link></li>
            <li><Link href="/segadeals" className="hover:text-text-primary">SegaDeals</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Perusahaan</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link href="/tentang" className="hover:text-text-primary">Tentang Kami</Link></li>
            <li><Link href="/bantuan" className="hover:text-text-primary">Pusat Bantuan</Link></li>
            <li><Link href="/kontak" className="hover:text-text-primary">Kontak</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link href="/syarat" className="hover:text-text-primary">Syarat & Ketentuan</Link></li>
            <li><Link href="/privasi" className="hover:text-text-primary">Kebijakan Privasi</Link></li>
            <li><Link href="/refund" className="hover:text-text-primary">Kebijakan Refund</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Segaloka. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}
