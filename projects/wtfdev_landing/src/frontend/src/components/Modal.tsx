import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative bg-card brutalist-border brutalist-shadow max-w-2xl w-full max-h-[85vh] overflow-y-auto",
          className
        )}
      >
        <div className="sticky top-0 bg-card border-b-3 border-primary px-6 py-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-black uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 transition-colors border-2 border-transparent hover:border-primary"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
