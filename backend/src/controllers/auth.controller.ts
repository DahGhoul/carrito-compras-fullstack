import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: "Usuario registrado",
      data: user
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return res.status(200).json({ success: true, data: result });
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await authService.refresh(refreshToken);
    return res.status(200).json({ success: true, data: tokens });
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logout(refreshToken);
    return res.status(200).json({ success: true, message: "Sesion cerrada" });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.id);
    return res.status(200).json({ success: true, data: user });
  }
};