import type { ReactNode } from "react";
import { cn } from "../utils/cn";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-150 border-3 border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-accent hover:border-accent brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
    secondary:
      "bg-accent text-white border-accent hover:bg-accent-dark brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
    outline:
      "bg-transparent text-primary hover:bg-primary hover:text-white brutalist-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
    ghost:
      "bg-transparent text-primary border-transparent hover:border-primary hover:bg-primary/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
