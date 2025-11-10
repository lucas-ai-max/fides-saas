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
import { santoService } from "@/services/santoService";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  
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

  const [santoPreview, setSantoPreview] = useState({
    nome: '',
    titulo: '',
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

    santoService.buscarSantoDoDia()
      .then((santo) => {
        setSantoPreview({
          nome: santo.nome,
          titulo: santo.titulo,
          loading: false,
        });
      })
      .catch(() => {
        setSantoPreview({
          nome: 'Erro ao carregar',
          titulo: '',
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background-secondary to-background-soft pb-24">
      {/* Header Mariano com Gradiente */}
      <header className="bg-gradient-to-br from-primary via-primary-light to-sky-blue px-6 pt-12 pb-20 rounded-b-[32px] shadow-xl relative overflow-hidden">
        {/* Efeito de luz sutil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Settings className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        
        {/* Saudação */}
        <div className="relative z-10">
          <h1 className="text-3xl font-heading font-semibold text-white mb-2">
            {greeting}! 🙏
          </h1>
          <p className="text-white/90 text-base font-body">
            Domingo, 9 de Novembro • <span className="font-medium">32º Domingo do Tempo Comum</span>
          </p>
        </div>
      </header>

      {/* Card Liturgia Sobrepondo Header */}
      <div className="px-6 -mt-12 mb-6 relative z-20 animate-fade-in-up">
        <Link to="/liturgy">
          <Card className="bg-card rounded-2xl shadow-2xl p-6 border border-primary/10 hover:shadow-mariano transition-all cursor-pointer hover:-translate-y-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Liturgia de Hoje
            </div>
            
            {liturgiaPreview.loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Carregando liturgia...</span>
              </div>
            ) : (
              <>
                {/* Texto Preview */}
                <p className="text-gray-text font-body text-sm leading-relaxed mb-3 line-clamp-2">
                  {liturgiaPreview.texto}
                </p>
                
                {/* Referência e CTA */}
                <div className="flex items-center justify-between">
                  {liturgiaPreview.referencia && (
                    <span className="text-accent font-semibold text-sm">
                      {liturgiaPreview.referencia}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                    Ler completa
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}
          </Card>
        </Link>
      </div>

      <div className="px-6 space-y-6 animate-fade-in-up">
        {/* Card Progresso */}
        <Card className="bg-card shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-text-primary flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              Continue seu caminho
            </h3>
            <span className="text-sm font-bold text-primary">75%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2.5 bg-gray-light rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-primary to-sky-blue rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
          </div>
          
          {/* Info */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-gray-text">📚 Fundamentos da Fé</span>
            <span className="font-semibold text-text-primary">5/7 dias</span>
          </div>
          
          {/* Streak */}
          <div className="pt-3 border-t border-gray-light flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-accent">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-semibold">12 dias</span>
            </div>
            <span className="text-xs text-gray-medium">de sequência</span>
          </div>
          
          {/* CTA Button */}
          <Link to="/plans">
            <Button className="w-full bg-gradient-to-r from-primary to-primary-light text-white shadow-mariano hover:shadow-lg">
              Continuar
            </Button>
          </Link>
        </Card>

        {/* Acesso Rápido */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-text uppercase tracking-wide">
            Acesso Rápido
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            {quickAccess.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={index} to={item.link}>
                  <Card className="p-5 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all cursor-pointer bg-card active:scale-95">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-sky-blue/10 rounded-2xl flex items-center justify-center">
                        <Icon className={`h-7 w-7 ${item.color}`} strokeWidth={2} />
                      </div>
                      <span className="text-xs font-semibold text-text-primary">
                        {item.label}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Santo do Dia */}
        <Card 
          onClick={() => navigate('/santo')}
          className="bg-gradient-to-br from-accent/5 to-accent-light/10 border-accent/20 shadow-md cursor-pointer overflow-hidden relative"
        >
          {/* Decoração */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">⭐</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-accent text-xs font-semibold mb-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                  Santo do Dia
                </div>
                {santoPreview.loading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-medium" />
                    <span className="text-sm text-gray-medium">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <h3 className="font-heading text-xl font-semibold text-text-primary mb-1 truncate">
                      {santoPreview.nome}
                    </h3>
                    <p className="text-sm text-gray-text line-clamp-2">{santoPreview.titulo}</p>
                  </>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            </div>
          </div>
        </Card>

        {/* Igrejas Próximas */}
        <Card 
          onClick={() => navigate('/igrejas-proximas')}
          className="border-l-4 border-l-primary shadow-md cursor-pointer"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">⛪</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-xl font-semibold text-text-primary">
                    Igrejas Próximas
                  </h3>
                  <ArrowRight className="w-5 h-5 text-accent flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-text mb-1">
                  Encontre igrejas católicas perto de você
                </p>
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-medium mt-2">
                  <Church className="w-3 h-3" />
                  Busca em raio de 5km
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation - Moderno e Clean */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-gray-light shadow-xl">
        <div className="flex items-center justify-around px-4 py-2.5 max-w-2xl mx-auto">
          <Link to="/home" className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl bg-primary/10 min-w-[72px]">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xs font-body font-semibold text-primary">Início</span>
          </Link>
          <Link to="/plans" className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl hover:bg-gray-light/50 transition-colors min-w-[72px]">
            <Target className="h-5 w-5 text-gray-medium" />
            <span className="text-xs font-body font-medium text-gray-medium">Aprender</span>
          </Link>
          <Link to="/prayers" className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl hover:bg-gray-light/50 transition-colors min-w-[72px]">
            <BookOpen className="h-5 w-5 text-gray-medium" />
            <span className="text-xs font-body font-medium text-gray-medium">Orar</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl hover:bg-gray-light/50 transition-colors min-w-[72px]">
            <Users className="h-5 w-5 text-gray-medium" />
            <span className="text-xs font-body font-medium text-gray-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Home;
