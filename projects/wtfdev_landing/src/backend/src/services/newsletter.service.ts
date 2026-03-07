import { newsletterRepository } from "../repositories/newsletter.repository.js";
import { NotFoundError } from "../utils/errors.js";

export const newsletterService = {
  async subscribe(email: string, source: string) {
    const existing = await newsletterRepository.findByEmail(email);

    if (existing && !existing.unsubscribed_at) {
      return {
        isNew: false,
        data: {
          message: "You're already subscribed!",
          email: existing.email,
          subscribed_at: existing.subscribed_at.toISOString(),
        },
      };
    }

    if (existing && existing.unsubscribed_at) {
      const resubscribed = await newsletterRepository.resubscribe(email);
      return {
        isNew: true,
        data: {
          id: resubscribed.id,
          email: resubscribed.email,
          subscribed_at: resubscribed.subscribed_at.toISOString(),
          source: resubscribed.source,
        },
      };
    }

    const subscriber = await newsletterRepository.create(email, source);
    return {
      isNew: true,
      data: {
        id: subscriber.id,
        email: subscriber.email,
        subscribed_at: subscriber.subscribed_at.toISOString(),
        source: subscriber.source,
      },
    };
  },

  async unsubscribe(email: string, _token: string) {
    const existing = await newsletterRepository.findByEmail(email);

    if (!existing) {
      throw new NotFoundError("Email not found in subscriber list");
    }

    if (existing.unsubscribed_at) {
      return {
        message: "Already unsubscribed",
        email: existing.email,
        unsubscribed_at: existing.unsubscribed_at.toISOString(),
      };
    }

    const updated = await newsletterRepository.unsubscribe(email);
    return {
      message: "Successfully unsubscribed",
      email: updated.email,
      unsubscribed_at: updated.unsubscribed_at?.toISOString(),
    };
  },
};
