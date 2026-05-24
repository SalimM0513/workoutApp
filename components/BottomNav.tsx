"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/workout", label: "Train", icon: "◎" },
  { href: "/calendar", label: "Cal", icon: "▦" },
  { href: "/history", label: "Log", icon: "☰" },
  { href: "/stats", label: "Stats", icon: "▲" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border bg-surface-raised/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {links.map(({ href, label, icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium transition-colors active:scale-95 sm:text-xs ${
                active
                  ? "text-accent"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className="text-lg leading-none sm:text-xl">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
