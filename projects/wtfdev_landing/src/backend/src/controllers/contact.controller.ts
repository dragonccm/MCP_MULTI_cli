import type { Request, Response } from "express";
import { contactService } from "../services/contact.service.js";
import { createContactSchema, contactQuerySchema } from "../utils/validators.js";

export const contactController = {
  async create(req: Request, res: Response): Promise<void> {
    const data = createContactSchema.parse(req.body);
    const result = await contactService.submitInquiry(data);
    res.status(201).json({
      success: true,
      data: result,
      message: "Contact inquiry submitted successfully",
    });
  },

  async getAll(req: Request, res: Response): Promise<void> {
    const filters = contactQuerySchema.parse(req.query);
    const result = await contactService.getInquiries(filters);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  },
};
