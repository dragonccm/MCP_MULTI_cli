import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../utils/cn";
import { NAV_LINKS } from "../utils/constants";
import { useScrollSpy } from "../hooks/useScrollSpy";

export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeId = useScrollSpy(
    NAV_LINKS.map((l) => l.href.slice(1)),
    120
  );

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-b-3 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="flex items-center gap-2 group" aria-label="WTFDev Home">
            <span className="font-black text-2xl sm:text-3xl tracking-tighter">
              WTF<span className="text-accent">Dev</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-150 border-2 border-transparent",
                  activeId === link.href.slice(1)
                    ? "bg-primary text-white"
                    : "hover:border-primary hover:bg-primary/5"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className="md:hidden p-2 border-2 border-primary hover:bg-primary hover:text-white transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <nav
          className="md:hidden bg-card border-t-3 border-primary"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={cn(
                  "block px-4 py-3 text-sm font-bold uppercase tracking-wider border-2 transition-colors",
                  activeId === link.href.slice(1)
                    ? "bg-primary text-white border-primary"
                    : "border-transparent hover:border-primary hover:bg-primary/5"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
