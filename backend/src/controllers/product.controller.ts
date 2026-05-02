import { Request, Response } from "express";
import { productService } from "../services/product.service";

export const productController = {
  async list(req: Request, res: Response) {
    const result = await productService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: req.query.search?.toString(),
      categoryId: req.query.categoryId?.toString(),
      active: req.query.active !== undefined ? req.query.active === "true" : undefined
    });

    return res.status(200).json({ success: true, ...result });
  },

  async getById(req: Request, res: Response) {
    const productId = String(req.params.id);
    const result = await productService.getById(productId);
    return res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const result = await productService.create(req.body);
    return res.status(201).json({ success: true, data: result });
  },

  async update(req: Request, res: Response) {
    const productId = String(req.params.id);
    const result = await productService.update(productId, req.body);
    return res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const productId = String(req.params.id);
    await productService.remove(productId);
    return res.status(200).json({ success: true, message: "Producto eliminado" });
  }
};