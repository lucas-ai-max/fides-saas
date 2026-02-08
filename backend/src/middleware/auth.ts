
import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { AppError } from "../utils/AppError.js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw new AppError(
        "AUTH_TOKEN_MISSING",
        "Token de autenticação não fornecido",
        401,
        "Você precisa estar logado para acessar este recurso.",
        { type: "login" }
      );
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError(
        "AUTH_TOKEN_INVALID",
        "Token inválido ou expirado",
        401,
        "Sua sessão expirou. Por favor, faça login novamente.",
        { type: "login" }
      );
    }

    (req as Request & { user: typeof user }).user = user;
    next();
  } catch (err) {
    next(err);
  }
}
