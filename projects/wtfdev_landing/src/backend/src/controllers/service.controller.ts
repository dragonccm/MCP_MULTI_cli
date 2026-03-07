import type { Request, Response } from "express";
import { serviceService } from "../services/service.service.js";
import { servicesQuerySchema, slugParamSchema } from "../utils/validators.js";

export const serviceController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const { include_inactive } = servicesQuerySchema.parse(req.query);
    const result = await serviceService.getAll(include_inactive);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = slugParamSchema.parse(req.params);
    const service = await serviceService.getBySlug(slug);
    res.status(200).json({
      success: true,
      data: service,
    });
  },
};
