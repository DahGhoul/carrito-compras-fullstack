import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

type ApiError = Error & { statusCode?: number };

export function notFound(req: Request, res: Response) {
  return res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` });
}

export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ message: err.message, stack: err.stack });

  return res.status(err.statusCode ?? 500).json({
    success: false,
    message: err.message || "Error interno del servidor"
  });
}