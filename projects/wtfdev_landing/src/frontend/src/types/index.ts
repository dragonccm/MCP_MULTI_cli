export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  company?: string;
  phone?: string;
  service_interest?: string;
}

export interface ContactInquiry extends ContactFormData {
  id: string;
  status: "pending" | "contacted" | "closed";
  created_at: string;
}

export interface NewsletterSubscribeData {
  email: string;
  source?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  source: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  gallery_urls: string[];
  client_name: string | null;
  technologies: string[];
  outcome: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description?: string;
  icon_url: string | null;
  features: string[];
  display_order: number;
  active: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages?: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationInfo;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}
