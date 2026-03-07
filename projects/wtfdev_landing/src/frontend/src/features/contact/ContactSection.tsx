import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../components/Button";
import { contactApi, newsletterApi, ApiError } from "../../services/api";
import {
  contactFormSchema,
  newsletterSchema,
} from "../../utils/validation";
import { SERVICES_DATA } from "../../utils/constants";

interface FieldErrors {
  [key: string]: string | undefined;
}

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
    phone: "",
    service_interest: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const validateField = (field: string, value: string) => {
    const testData = { ...formData, [field]: value };
    const result = contactFormSchema.safeParse(testData);
    if (!result.success) {
      const fieldError = result.error.issues.find((issue) =>
        issue.path.includes(field)
      );
      return fieldError?.message;
    }
    return undefined;
  };

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitStatus("idle");
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");

    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    setIsSubmitting(true);
    try {
      await contactApi.submit(formData);
      setSubmitStatus("success");
      setSubmitMessage("Thank you! We'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        message: "",
        company: "",
        phone: "",
        service_interest: "",
      });
      setTouched({});
      setErrors({});
    } catch (error) {
      setSubmitStatus("error");
      if (error instanceof ApiError) {
        setSubmitMessage(error.message);
        if (error.details) {
          const fieldErrors: FieldErrors = {};
          error.details.forEach((d) => {
            fieldErrors[d.field] = d.message;
          });
          setErrors(fieldErrors);
        }
      } else {
        setSubmitMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = newsletterSchema.safeParse({ email: newsletterEmail });
    if (!result.success) {
      setNewsletterStatus("error");
      setNewsletterMessage(result.error.issues[0].message);
      return;
    }

    setNewsletterStatus("loading");
    try {
      const response = await newsletterApi.subscribe({
        email: newsletterEmail,
        source: "contact-section",
      });
      setNewsletterStatus("success");
      setNewsletterMessage(
        "message" in response ? response.message : "Thanks for subscribing!"
      );
      setNewsletterEmail("");
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(
        error instanceof ApiError ? error.message : "Something went wrong"
      );
    }
  };

  const messageLength = formData.message.length;
  const maxMessage = 2000;

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-sm font-bold text-accent uppercase tracking-widest">
            // Get In Touch
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-4">
            Contact Us
          </h2>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            Ready to transform your business? Let&apos;s talk about your project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-card brutalist-border brutalist-shadow p-8"
              noValidate
            >
              {submitStatus !== "idle" && (
                <div
                  className={`flex items-start gap-3 p-4 mb-6 border-2 ${
                    submitStatus === "success"
                      ? "bg-green-50 border-green-500 text-green-800"
                      : "bg-red-50 border-red-500 text-red-800"
                  }`}
                  role="alert"
                >
                  {submitStatus === "success" ? (
                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{submitMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-bold uppercase tracking-wider mb-2"
                  >
                    Name <span className="text-accent">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className={`w-full px-4 py-3 border-2 bg-surface text-sm focus:outline-none focus:border-accent transition-colors ${
                      touched.name && errors.name
                        ? "border-error"
                        : "border-primary/30"
                    }`}
                    placeholder="John Doe"
                    required
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-xs text-error font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-bold uppercase tracking-wider mb-2"
                  >
                    Email <span className="text-accent">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full px-4 py-3 border-2 bg-surface text-sm focus:outline-none focus:border-accent transition-colors ${
                      touched.email && errors.email
                        ? "border-error"
                        : "border-primary/30"
                    }`}
                    placeholder="john@example.com"
                    required
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-error font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="contact-company"
                    className="block text-sm font-bold uppercase tracking-wider mb-2"
                  >
                    Company
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-primary/30 bg-surface text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Acme Inc"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-service"
                    className="block text-sm font-bold uppercase tracking-wider mb-2"
                  >
                    Service Interest
                  </label>
                  <select
                    id="contact-service"
                    value={formData.service_interest}
                    onChange={(e) =>
                      handleChange("service_interest", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-primary/30 bg-surface text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Select a service...</option>
                    {SERVICES_DATA.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-bold uppercase tracking-wider mb-2"
                >
                  Message <span className="text-accent">*</span>
                </label>
                <textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => {
                    if (e.target.value.length <= maxMessage) {
                      handleChange("message", e.target.value);
                    }
                  }}
                  onBlur={() => handleBlur("message")}
                  rows={5}
                  className={`w-full px-4 py-3 border-2 bg-surface text-sm focus:outline-none focus:border-accent transition-colors resize-none ${
                    touched.message && errors.message
                      ? "border-error"
                      : "border-primary/30"
                  }`}
                  placeholder="Tell us about your project..."
                  required
                />
                <div className="flex justify-between mt-1">
                  {touched.message && errors.message ? (
                    <p className="text-xs text-error font-medium">
                      {errors.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-xs font-mono ${
                      messageLength > maxMessage * 0.9
                        ? "text-error"
                        : "text-muted"
                    }`}
                  >
                    {messageLength}/{maxMessage}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                <Send size={16} className="mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card brutalist-border brutalist-shadow p-8">
              <h3 className="font-black uppercase tracking-wider text-lg mb-4">
                Newsletter
              </h3>
              <p className="text-muted text-sm mb-6">
                Subscribe for AI automation insights, tips, and updates.
              </p>
              <form onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    setNewsletterStatus("idle");
                  }}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-primary/30 bg-surface text-sm focus:outline-none focus:border-accent transition-colors mb-3"
                  aria-label="Email for newsletter"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  loading={newsletterStatus === "loading"}
                  disabled={newsletterStatus === "loading"}
                >
                  Subscribe
                </Button>
                {newsletterStatus !== "idle" && newsletterStatus !== "loading" && (
                  <p
                    className={`mt-3 text-xs font-medium ${
                      newsletterStatus === "success"
                        ? "text-success"
                        : "text-error"
                    }`}
                    role="status"
                  >
                    {newsletterMessage}
                  </p>
                )}
              </form>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8">
              <h3 className="font-black uppercase tracking-wider text-lg mb-4">
                Quick Info
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-bold uppercase tracking-wider text-xs text-muted mb-1">
                    Response Time
                  </p>
                  <p>Within 24 hours</p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-xs text-muted mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:hello@wtfdev.com"
                    className="text-accent hover:underline"
                  >
                    hello@wtfdev.com
                  </a>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-xs text-muted mb-1">
                    Location
                  </p>
                  <p>Remote-first, Worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
