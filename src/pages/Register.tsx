import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cross, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/home", { replace: true });
  }, [isAuthenticated, navigate]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const result = await register(email.trim(), password, name.trim() || undefined);
      if (result?.message) {
        setMessage(result.message);
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
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
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-primary">
            Criar conta
          </h1>
          <p className="text-muted-foreground font-body">
            Junte-se ao Fides e comece sua jornada de fé
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
          {message && (
            <div className="rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3">
              {message}
            </div>
          )}
          <div className="space-y-2 text-left">
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-12 rounded-xl"
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
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
              "Criar conta"
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
