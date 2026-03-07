import type { Request, Response } from "express";
import { newsletterService } from "../services/newsletter.service.js";
import {
  newsletterSubscribeSchema,
  newsletterUnsubscribeSchema,
} from "../utils/validators.js";

export const newsletterController = {
  async subscribe(req: Request, res: Response): Promise<void> {
    const { email, source } = newsletterSubscribeSchema.parse(req.body);
    const result = await newsletterService.subscribe(email, source);
    const status = result.isNew ? 201 : 200;
    res.status(status).json({
      success: true,
      ...result.data,
    });
  },

  async unsubscribe(req: Request, res: Response): Promise<void> {
    const { email, token } = newsletterUnsubscribeSchema.parse(req.body);
    const result = await newsletterService.unsubscribe(email, token);
    res.status(200).json({
      success: true,
      ...result,
    });
  },
};
