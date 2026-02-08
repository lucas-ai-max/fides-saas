import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cross, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/home", { replace: true });
  }, [isAuthenticated, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-stone-gray flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-8">
        <div className="animate-scale-in">
          <Cross className="w-20 h-20 text-liturgical-gold" strokeWidth={1.5} />
        </div>
        <div className="space-y-2 animate-slide-up">
          <h1 className="text-3xl font-heading font-semibold text-primary">
            Entrar no Fides
          </h1>
          <p className="text-muted-foreground font-body">
            Acesse sua conta para continuar sua jornada de fé
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 animate-slide-up"
        >
          {error && (
            <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
              {error}
            </div>
          )}
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-12 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base rounded-xl h-14"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
