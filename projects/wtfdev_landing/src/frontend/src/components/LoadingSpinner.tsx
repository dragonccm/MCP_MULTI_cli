import { cn } from "../utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "border-primary border-t-transparent rounded-full animate-spin",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-8">
      <div className="h-8 bg-border-light rounded w-1/3 mx-auto" />
      <div className="h-4 bg-border-light rounded w-2/3 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-border-light rounded" />
        ))}
      </div>
    </div>
  );
}
