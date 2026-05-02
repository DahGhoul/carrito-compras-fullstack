import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { orderService } from "../services/order.service";

export const orderController = {
  async checkout(req: Request, res: Response) {
    const order = await orderService.checkout(req.user!.id, req.body);
    return res.status(201).json({ success: true, data: order });
  },

  async myOrders(req: Request, res: Response) {
    const orders = await orderService.myOrders(req.user!.id);
    return res.status(200).json({ success: true, data: orders });
  },

  async allOrders(_req: Request, res: Response) {
    const orders = await orderService.listAll();
    return res.status(200).json({ success: true, data: orders });
  },

  async getById(req: Request, res: Response) {
    const order = await orderService.getById(String(req.params.orderId));
    return res.status(200).json({ success: true, data: order });
  },

  async updateStatus(req: Request, res: Response) {
    const orderId = String(req.params.orderId);
    const updated = await orderService.updateStatus(
      orderId,
      req.body.status as OrderStatus,
      req.body.comment,
      req.user!.id
    );

    return res.status(200).json({ success: true, data: updated });
  }
};