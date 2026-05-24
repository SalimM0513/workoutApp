import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg";
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-black font-semibold hover:bg-accent-muted active:bg-accent-muted",
  secondary:
    "bg-surface-raised border border-surface-border text-zinc-100 hover:bg-zinc-800",
  ghost: "bg-transparent text-zinc-300 hover:bg-zinc-800/50",
  danger: "bg-red-600/90 text-white hover:bg-red-600",
};

const sizes = {
  md: "min-h-[48px] px-5 py-3 text-base rounded-xl",
  lg: "min-h-[56px] px-6 py-4 text-lg rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
