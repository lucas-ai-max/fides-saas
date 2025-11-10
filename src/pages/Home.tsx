import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Menu,
  Bell,
  Settings,
  BookOpen,
  MessageCircle,
  Church,
  Cross,
  Library,
  Target,
  Users,
  Flame,
  Loader2,
  ArrowRight
} from "lucide-react";
import { liturgiaService } from "@/services/liturgiaService";

const Home = () => {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  });

  const [liturgiaPreview, setLiturgiaPreview] = useState({
    texto: '',
    referencia: '',
    loading: true,
  });

  useEffect(() => {
    liturgiaService.buscarLiturgiaDoDia()
      .then((liturgia) => {
        const evangelho = liturgia.leituras.find((l) => l.tipo === 'evangelho');
        if (evangelho) {
          setLiturgiaPreview({
            texto: evangelho.texto.substring(0, 150) + '...',
            referencia: evangelho.referencia,
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar liturgia preview:', error);
        setLiturgiaPreview({
          texto: 'Não foi possível carregar a liturgia do dia',
          referencia: '',
          loading: false,
        });
      });
  }, []);

  const quickAccess = [
    { icon: MessageCircle, label: "Catequista", link: "/catechist", color: "text-primary" },
    { icon: BookOpen, label: "Orações", link: "/prayers", color: "text-accent" },
    { icon: Church, label: "Igrejas", link: "/churches", color: "text-success" },
    { icon: Cross, label: "Exame", link: "/examination", color: "text-primary" },
    { icon: Library, label: "Biblioteca", link: "/library", color: "text-accent" },
    { icon: Target, label: "Planos", link: "/plans", color: "text-success" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-stone-gray pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 animate-fade-in">
        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-semibold text-primary">
            {greeting}! ✝️
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground font-body">
            <span>Domingo, 9 de Novembro</span>
            <span>•</span>
            <span className="text-liturgical-gold">32º Domingo do Tempo Comum</span>
          </div>
        </div>

        {/* Liturgia de Hoje */}
        <Link to="/liturgy">
          <Card className="p-6 bg-gradient-to-br from-card to-stone-gray border-l-4 border-l-liturgical-gold shadow-md hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <BookOpen className="h-6 w-6 text-liturgical-gold flex-shrink-0 mt-1" />
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-semibold text-primary">
                    📖 Liturgia de Hoje
                  </h3>
                  <ArrowRight className="w-5 h-5 text-accent flex-shrink-0" />
                </div>
                {liturgiaPreview.loading ? (
                  <div className="flex items-center gap-2 py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Carregando liturgia da CNBB...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground font-body leading-relaxed line-clamp-3">
                      {liturgiaPreview.texto}
                    </p>
                    {liturgiaPreview.referencia && (
                      <p className="text-sm text-liturgical-gold font-body">
                        {liturgiaPreview.referencia}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>

        {/* Progresso do Plano */}
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-semibold text-primary mb-1">
                  ⚡ Continue seu caminho
                </h3>
                <p className="text-muted-foreground font-body">
                  📚 Fundamentos da Fé
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-success font-medium">
                  <Flame className="h-4 w-4" />
                  <span>12 dias</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium text-primary">5/7 dias</span>
              </div>
              <Progress value={75} className="h-3" />
            </div>

            <Link to="/plans">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Continuar
              </Button>
            </Link>
          </div>
        </Card>

        {/* Acesso Rápido */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-semibold text-primary">
            Acesso Rápido
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickAccess.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={index} to={item.link}>
                  <Card className="p-4 hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-card">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Icon className={`h-8 w-8 ${item.color}`} strokeWidth={2} />
                      <p className="text-xs font-body font-medium text-foreground">
                        {item.label}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Santo do Dia */}
        <Card className="p-6 shadow-md">
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-semibold text-primary">
              👤 Santo do Dia
            </h3>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                <Users className="h-8 w-8 text-liturgical-gold" />
              </div>
              <div className="space-y-2">
                <h4 className="font-heading text-lg font-semibold text-primary">
                  🌟 São Martinho de Tours
                </h4>
                <p className="text-sm text-muted-foreground font-body line-clamp-3 leading-relaxed">
                  Soldado romano que dividiu sua capa com um mendigo. Mais tarde tornou-se bispo e é conhecido por sua humildade e caridade...
                </p>
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                  Conhecer sua vida →
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="flex items-center justify-around p-4">
          <Link to="/home" className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-body font-semibold text-primary">Início</span>
          </Link>
          <Link to="/plans" className="flex flex-col items-center gap-1">
            <Target className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-body text-muted-foreground">Aprender</span>
          </Link>
          <Link to="/prayers" className="flex flex-col items-center gap-1">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-body text-muted-foreground">Orar</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-body text-muted-foreground">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Home;
