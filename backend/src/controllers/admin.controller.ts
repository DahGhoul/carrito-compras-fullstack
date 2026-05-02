import { Request, Response } from "express";
import { adminService } from "../services/admin.service";

export const adminController = {
  async dashboard(_req: Request, res: Response) {
    const data = await adminService.dashboard();
    return res.status(200).json({ success: true, data });
  },

  async listClientes(_req: Request, res: Response) {
    const data = await adminService.listClientes();
    return res.status(200).json({ success: true, data });
  },

  async listInventoryMovements(_req: Request, res: Response) {
    const data = await adminService.listInventoryMovements();
    return res.status(200).json({ success: true, data });
  }
};