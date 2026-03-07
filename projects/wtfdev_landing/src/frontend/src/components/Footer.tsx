import { useState } from "react";
import { Send } from "lucide-react";
import { NAV_LINKS } from "../utils/constants";
import { newsletterApi, ApiError } from "../services/api";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const result = await newsletterApi.subscribe({ email, source: "footer" });
      setStatus("success");
      setMessage("message" in result ? result.message : "Thanks for subscribing!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof ApiError ? error.message : "Something went wrong");
    }
  };

  return (
    <footer className="bg-primary text-white border-t-3 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="font-black text-2xl tracking-tighter">
              WTF<span className="text-accent">Dev</span>
            </span>
            <p className="mt-4 text-white/70 text-sm leading-relaxed">
              AI automation, web development, and DevOps solutions for modern businesses.
            </p>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-sm mb-4">
              Quick Links
            </h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-sm mb-4">
              Newsletter
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Stay updated with our latest insights on AI automation.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                }}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2 bg-white/10 border-2 border-white/30 text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent transition-colors"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-4 py-2 bg-accent border-2 border-accent hover:bg-accent-dark transition-colors disabled:opacity-50"
                aria-label="Subscribe to newsletter"
              >
                {status === "loading" ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
            {status !== "idle" && status !== "loading" && (
              <p
                className={`mt-2 text-xs ${
                  status === "success" ? "text-green-400" : "text-red-400"
                }`}
                role="status"
              >
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/50 text-xs">
          <p>&copy; {new Date().getFullYear()} WTFDev. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
