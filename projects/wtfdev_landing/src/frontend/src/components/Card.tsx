import type { ReactNode } from "react";
import { cn } from "../utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "bg-card brutalist-border brutalist-shadow p-6",
        hover &&
          "cursor-pointer transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
