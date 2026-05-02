import { NextFunction, Request, Response } from "express";

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    const hasRole = req.user.roles.some((role: string) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    return next();
  };
}