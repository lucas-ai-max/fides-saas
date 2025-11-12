import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Bell,
  Sparkles,
  BookOpen,
  MessageCircle,
  Church,
  Heart,
  TrendingUp,
  Award,
  Flame,
  ChevronRight,
  FileText,
  BookMarked,
} from "lucide-react";
import { liturgiaService } from "@/services/liturgiaService";
import { santoService } from "@/services/santoService";

const Home = () => {
  const navigate = useNavigate();
  
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  });

  const userName = "João"; // TODO: Pegar do contexto/storage

  const [liturgiaPreview, setLiturgiaPreview] = useState({
    texto: '',
    referencia: '',
    tempoLiturgico: '32º Domingo do Tempo Comum',
    corLiturgica: 'Verde',
    loading: true,
  });

  const [santoPreview, setSantoPreview] = useState({
    nome: '',
    titulo: '',
    festa: '',
    loading: true,
  });

  // Dados mockados de progresso (substituir por dados reais)
  const stats = {
    streak: 7,
    lessonsCompleted: 12,
    prayersToday: 3,
  };

  useEffect(() => {
    liturgiaService.buscarLiturgiaDoDia()
      .then((liturgia) => {
        const evangelho = liturgia.leituras.find((l) => l.tipo === 'evangelho');
        if (evangelho) {
          setLiturgiaPreview({
            texto: evangelho.texto.substring(0, 180) + '...',
            referencia: evangelho.referencia,
            tempoLiturgico: typeof liturgia.data === 'string' ? liturgia.data : '32º Domingo do Tempo Comum',
            corLiturgica: 'Verde', // TODO: Extrair da API
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar liturgia preview:', error);
        setLiturgiaPreview({
          texto: 'Não foi possível carregar a liturgia do dia',
          referencia: '',
          tempoLiturgico: 'Tempo Comum',
          corLiturgica: 'Verde',
          loading: false,
        });
      });

    santoService.buscarSantoDoDia()
      .then((santo) => {
        setSantoPreview({
          nome: santo.nome,
          titulo: santo.titulo,
          festa: '11 de Novembro',
          loading: false,
        });
      })
      .catch(() => {
        setSantoPreview({
          nome: 'Erro ao carregar',
          titulo: '',
          festa: '',
          loading: false,
        });
      });
  }, []);

  // Grid de acesso rápido
  const quickAccess = [
    { 
      icon: MessageCircle, 
      label: 'Catequista', 
      path: '/catechist',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      icon: BookOpen, 
      label: 'Liturgia', 
      path: '/liturgy',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 dark:bg-purple-950',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    { 
      icon: Heart, 
      label: 'Orações', 
      path: '/prayers',
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50 dark:bg-pink-950',
      textColor: 'text-pink-600 dark:text-pink-400'
    },
    { 
      icon: Church, 
      label: 'Igrejas', 
      path: '/churches',
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 dark:bg-amber-950',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    { 
      icon: FileText, 
      label: 'Exame', 
      path: '/examination',
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50 dark:bg-teal-950',
      textColor: 'text-teal-600 dark:text-teal-400'
    },
    { 
      icon: BookMarked, 
      label: 'Planos', 
      path: '/plans',
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 dark:bg-indigo-950',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
  ];

  const getCorLiturgicaColor = (cor: string) => {
    switch (cor.toLowerCase()) {
      case 'verde': return 'bg-green-400';
      case 'roxo': case 'violeta': return 'bg-purple-400';
      case 'branco': return 'bg-white';
      case 'vermelho': return 'bg-red-400';
      default: return 'bg-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-background-secondary dark:bg-background-primary">
      {/* HEADER COM GRADIENTE MARIANO */}
      <header className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-6 pt-12 pb-32 rounded-b-[32px] shadow-xl overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />
        
        {/* Conteúdo */}
        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="relative w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Bell className="w-5 h-5 text-white" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-primary-600">
                  3
                </span>
              </button>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Saudação */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {greeting}, {userName}! 🙏
            </h1>
            <p className="text-white/90 text-base font-medium">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className={`w-2.5 h-2.5 rounded-full ${getCorLiturgicaColor(liturgiaPreview.corLiturgica)}`} />
              <span className="text-sm font-semibold text-white">
                {liturgiaPreview.tempoLiturgico}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO - Cards sobrepostos ao header */}
      <div className="px-6 -mt-20 pb-28 space-y-6 relative z-20">
        {/* CARD: LITURGIA DO DIA */}
        <Card 
          variant="elevated" 
          padding="none" 
          className="overflow-hidden bg-card shadow-2xl"
          interactive
          onClick={() => navigate('/liturgy')}
        >
          {/* Header do card */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 px-5 py-4 border-b border-purple-100 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400">
                    Liturgia do Dia
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Toque para ler completa
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-tertiary" />
            </div>
          </div>
          
          {/* Preview do Evangelho */}
          <div className="p-5">
            {liturgiaPreview.loading ? (
              <LoadingSpinner size="sm" text="Carregando..." />
            ) : (
              <>
                <Badge variant="primary" className="mb-3">
                  <BookOpen className="w-3 h-3" />
                  {liturgiaPreview.referencia}
                </Badge>
                <p className="font-serif text-base text-text-primary dark:text-text-primary line-clamp-3 leading-relaxed">
                  {liturgiaPreview.texto}
                </p>
              </>
            )}
          </div>
        </Card>

        {/* CARD: PROGRESSO/STREAK */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Seu Progresso
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/plans')}
            >
              Ver tudo
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Sequência */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-2xl p-4 border border-orange-100 dark:border-orange-800">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full mb-2 mx-auto">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-center text-orange-600 dark:text-orange-400">
                {stats.streak}
              </p>
              <p className="text-xs text-center text-text-secondary mt-1">
                dias seguidos
              </p>
            </div>
            
            {/* Lições */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full mb-2 mx-auto">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">
                {stats.lessonsCompleted}
              </p>
              <p className="text-xs text-center text-text-secondary mt-1">
                lições feitas
              </p>
            </div>
            
            {/* Orações */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 rounded-2xl p-4 border border-pink-100 dark:border-pink-800">
              <div className="flex items-center justify-center w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full mb-2 mx-auto">
                <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-2xl font-bold text-center text-pink-600 dark:text-pink-400">
                {stats.prayersToday}
              </p>
              <p className="text-xs text-center text-text-secondary mt-1">
                orações hoje
              </p>
            </div>
          </div>
        </Card>

        {/* GRID: ACESSO RÁPIDO */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4 px-1">
            Acesso Rápido
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickAccess.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`${item.lightColor} rounded-2xl p-4 border border-border-light hover:border-border-default transition-all active:scale-95 flex flex-col items-center gap-3`}
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${item.textColor} text-center`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CARD: SANTO DO DIA */}
        <Card 
          variant="gradient"
          padding="none"
          interactive
          onClick={() => navigate('/santo')}
        >
          <div className="relative p-6">
            {/* Decoração */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            
            <div className="relative flex items-center gap-4">
              {/* Ícone */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              {/* Texto */}
              <div className="flex-1">
                {santoPreview.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <p className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-1">
                      🌟 Santo do Dia
                    </p>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {santoPreview.nome}
                    </h4>
                    <p className="text-sm text-white/90">
                      {santoPreview.festa}
                    </p>
                  </>
                )}
              </div>
              
              {/* Chevron */}
              <ChevronRight className="w-6 h-6 text-white/60 flex-shrink-0" />
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
