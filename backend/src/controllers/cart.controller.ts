import { Request, Response } from "express";
import { cartService } from "../services/cart.service";

export const cartController = {
  async getMyCart(req: Request, res: Response) {
    const cart = await cartService.getCart(req.user!.id);
    return res.status(200).json({ success: true, data: cart });
  },

  async addItem(req: Request, res: Response) {
    const cart = await cartService.addItem(req.user!.id, req.body);
    return res.status(200).json({ success: true, data: cart });
  },

  async updateItem(req: Request, res: Response) {
    const itemId = String(req.params.itemId);
    const cart = await cartService.updateItem(req.user!.id, itemId, req.body.quantity);
    return res.status(200).json({ success: true, data: cart });
  },

  async removeItem(req: Request, res: Response) {
    const itemId = String(req.params.itemId);
    const cart = await cartService.removeItem(req.user!.id, itemId);
    return res.status(200).json({ success: true, data: cart });
  },

  async sync(req: Request, res: Response) {
    const cart = await cartService.sync(req.user!.id, req.body.items);
    return res.status(200).json({ success: true, data: cart });
  }
};