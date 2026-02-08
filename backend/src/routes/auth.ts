import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    if (error) {
      const status = error.message.includes("Invalid login") ? 401 : 400;
      res.status(status).json({ error: error.message });
      return;
    }

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim().toLowerCase(),
      password: String(password),
      options: {
        data: name ? { full_name: String(name).trim() } : undefined,
      },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (!data.session && data.user) {
      res.status(201).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
        },
        message: "Conta criada. Verifique seu email para confirmar o cadastro.",
      });
      return;
    }

    res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
    });
  } catch (e) {
    console.error("Register error:", e);
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

router.get("/me", requireAuth, (req: Request, res: Response) => {
  const user = (req as Request & { user: { id: string; email?: string; created_at: string; user_metadata?: Record<string, unknown> } }).user;
  res.json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    full_name: user.user_metadata?.full_name,
  });
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      res.status(400).json({ error: "refresh_token é obrigatório" });
      return;
    }
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: String(refresh_token),
    });
    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }
    res.json({
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
    });
  } catch (e) {
    console.error("Refresh error:", e);
    res.status(500).json({ error: "Erro ao renovar sessão" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logout realizado" });
});

export const authRouter = router;
