import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error("❌ Error:", err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                user_message: err.userMessage,
                action: err.action,
                retry: err.retry
            }
        });
    }

    // Generic/Unexpected Error
    return res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
            user_message: "Tivemos um problema técnico. Por favor, tente novamente em instantes.",
            retry: {
                allowed: true,
                after_seconds: 5
            }
        }
    });
}
