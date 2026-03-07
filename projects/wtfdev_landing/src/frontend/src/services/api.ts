import type {
  ContactFormData,
  ContactInquiry,
  NewsletterSubscribeData,
  NewsletterSubscriber,
} from "../types";
import { API_BASE_URL } from "../utils/constants";

class ApiError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    status: number,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Request failed",
        message: `HTTP ${response.status}`,
      }));
      throw new ApiError(
        errorData.message || errorData.error,
        response.status,
        errorData.details
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw new ApiError("Network error. Please check your connection.", 0);
  }
}

export const contactApi = {
  submit: (data: ContactFormData) =>
    request<ContactInquiry>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const newsletterApi = {
  subscribe: (data: NewsletterSubscribeData) =>
    request<NewsletterSubscriber | { message: string }>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export { ApiError };
