"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Le Club", href: "/#manifesto" },
  { label: "Boutique", href: "/shop", highlight: true },
  { label: "Actus", href: "/news" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Contact", href: "/contact" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export function Navbar() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 top-6 z-50 mx-auto flex w-[96vw] max-w-5xl items-center justify-between gap-4 rounded-[30px] border border-white/10 bg-black/40 px-5 py-3 shadow-[0_40px_120px_rgba(0,0,0,0.85)] backdrop-blur-3xl transition-transform duration-500 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:bg-black/60"
    >
      <Link
        href="/"
        aria-label="Accueil"
        className={`flex items-center ${focusRing}`}
      >
        <Image
          src="/gba-logo.png"
          alt="GBA Logo"
          width={56}
          height={56}
          priority
          className="h-14 w-14 rounded-2xl bg-transparent p-1"
        />
      </Link>

      <div className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.38em] text-white/70 md:flex">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative px-3 py-1 transition-colors duration-300 hover:text-white ${focusRing} ${
                isActive ? "text-white" : ""
              } ${link.highlight ? "rounded-full border border-white/15 bg-white/5" : ""}`}
            >
              {link.label}
              <span
                className={`absolute left-0 bottom-0 h-[1px] w-full origin-left bg-white transition-transform duration-300 motion-reduce:transition-none motion-reduce:scale-x-100 ${
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/shop"
            className={`rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-[0.32em] text-white/75 transition hover:border-white/35 hover:bg-white/10 ${focusRing}`}
            aria-label="Accéder à la boutique"
          >
            Boutique
          </Link>
          <Link
            href="/news"
            className={`rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-[0.32em] text-white/75 transition hover:border-white/35 hover:bg-white/10 ${focusRing}`}
            aria-label="Voir les actus"
          >
            Actus
          </Link>
        </div>

        <Link
          href="/login?next=/dashboard"
          aria-current={isLogin ? "page" : undefined}
          aria-label="Accès staff"
          className={`group relative overflow-hidden rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white transition hover:border-white/60 hover:bg-white/20 whitespace-nowrap min-w-max sm:px-5 ${focusRing}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-[#0065BD]/35 via-[#00A1FF]/30 to-[#2AA7FF]/35 opacity-0 blur-md transition-opacity duration-300 motion-reduce:transition-none group-hover:opacity-100"
          />
          <span className="relative inline-flex items-center gap-2 whitespace-nowrap">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className="opacity-80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 11V8a5 5 0 0 0-10 0v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Accès staff</span>
          </span>
        </Link>
      </div>
    </nav>
  );
}
