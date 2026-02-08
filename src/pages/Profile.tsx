import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { usePrayers, useFavorites } from "@/hooks/usePrayers";
import { usePrayerHistory } from "@/hooks/usePrayers";
import {
  LogOut,
  Mail,
  Flame,
  Heart,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Mesmos dados de estatísticas da Home (fonte única para Streak; orações = histórico real)
const STREAK_DIAS = 7;

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { prayers, loading: prayersLoading } = usePrayers();
  const { favorites } = useFavorites();
  const { getPrayerCount } = usePrayerHistory();

  const userName =
    user?.full_name ??
    (user?.email ? user.email.split("@")[0] : null) ??
    "Fiel";

  const oracoesFeitas = getPrayerCount();

  const favoritePrayers = useMemo(() => {
    return prayers.filter((p) => favorites.includes(p.id));
  }, [prayers, favorites]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-24 transition-colors duration-300">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-heading font-semibold text-primary">Perfil</h1>
        <ThemeToggle />
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* 1. Avatar e Nome */}
        <Card className="overflow-hidden border-primary-200/50 dark:border-primary-800/50 shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-20 w-20 rounded-full border-2 border-primary-200 dark:border-primary-800">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-heading font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <p className="text-lg font-heading font-semibold text-primary">
                  {userName}
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-4 h-4" />
                  {user?.email ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Estatísticas (Streak e Orações Feitas) */}
        <Card className="overflow-hidden border-primary-200/50 dark:border-primary-800/50 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Sua jornada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-accent-50 dark:bg-accent-950/30 border border-accent-200/50 dark:border-accent-800/30 p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Flame className="w-8 h-8 text-accent-600 dark:text-accent-400" />
                </div>
                <p className="text-2xl font-bold text-accent-700 dark:text-accent-400">
                  {STREAK_DIAS}
                </p>
                <p className="text-xs font-medium text-accent-800/80 dark:text-accent-300/80 mt-0.5">
                  dias caminhando com Deus
                </p>
              </div>
              <div className="rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/30 p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Heart className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  {oracoesFeitas}
                </p>
                <p className="text-xs font-medium text-primary-800/80 dark:text-primary-300/80 mt-0.5">
                  orações feitas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Orações Favoritas */}
        <Card className="overflow-hidden border-primary-200/50 dark:border-primary-800/50 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              Orações favoritas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prayersLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Carregando...
              </p>
            ) : favoritePrayers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma oração favorita. Toque no coração nas orações para salvar aqui.
              </p>
            ) : (
              <ScrollArea className="h-[240px] pr-2">
                <ul>
                  {favoritePrayers.map((prayer, index) => (
                    <li key={prayer.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/prayers/${prayer.id}`)}
                        className="w-full flex items-center justify-between gap-2 py-3 px-3 rounded-lg hover:bg-muted/60 transition-colors text-left"
                      >
                        <span className="font-medium text-foreground truncate">
                          {prayer.title}
                        </span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </button>
                      {index < favoritePrayers.length - 1 && <Separator />}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* 4. Logout */}
        <Button
          variant="outline"
          size="lg"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive font-medium rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
