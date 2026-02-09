import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Sparkles,
  MessageCircle,
  Bell,
  Heart,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { liturgiaService } from "@/services/liturgiaService";
import { santoService } from "@/services/santoService";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileMenu } from "@/components/ProfileMenu";
import { MyPath } from "@/components/MyPath";
import { ImDownDrawer } from "@/components/ImDownDrawer";
import { GuidedSilence } from "@/components/GuidedSilence";

const COR_LITURGICA_SIGNIFICADO: Record<string, { label: string; explicacao: string }> = {
  verde: { label: "Verde", explicacao: "Tempo Comum, esperança e crescimento na fé." },
  roxo: { label: "Roxo", explicacao: "Advento e Quaresma, penitência e preparação." },
  branco: { label: "Branco", explicacao: "Festas do Senhor, Natal e Páscoa, alegria." },
  vermelho: { label: "Vermelho", explicacao: "Pentecostes e mártires, Espírito Santo e amor." },
  rosa: { label: "Rosa", explicacao: "Alegria no meio do Advento ou da Quaresma." },
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  });

  // Nome: useAuth (Supabase/API) → display_name ou full_name ou email → session em localStorage → "Fiel"
  const getNomeFromStorage = (): string | null => {
    try {
      const raw = localStorage.getItem("fides_session");
      if (!raw) return null;
      const data = JSON.parse(raw) as {
        user?: { display_name?: string; full_name?: string; email?: string };
      };
      const u = data?.user;
      return (
        u?.display_name ??
        u?.full_name ??
        (u?.email ? u.email.split("@")[0] : null) ??
        null
      );
    } catch {
      return null;
    }
  };
  const userName =
    user?.display_name ??
    user?.full_name ??
    (user?.email ? user.email.split("@")[0] : null) ??
    getNomeFromStorage() ??
    "Fiel";

  const [liturgiaPreview, setLiturgiaPreview] = useState({
    texto: "",
    referencia: "",
    cor: null as "verde" | "roxo" | "branco" | "vermelho" | "rosa" | null,
    tempo: "",
    loading: true,
  });

  const [santoPreview, setSantoPreview] = useState({
    nome: "",
    titulo: "",
    festa: "",
    loading: true,
  });

  const stats = {
    diasComDeus: 7,
    aprendizados: 12,
    momentosOracao: 3,
  };

  useEffect(() => {
    liturgiaService
      .buscarLiturgiaDoDia()
      .then((liturgia) => {
        const evangelho = liturgia.leituras.find((l) => l.tipo === "evangelho");
        if (evangelho) {
          setLiturgiaPreview({
            texto: evangelho.texto.replace(/[0-9]+(?=[a-zA-Zà-úÀ-Ú])/g, "").substring(0, 180) + "...",
            referencia: evangelho.referencia,
            cor: liturgia.cor ?? null,
            tempo: liturgia.tempo ?? "",
            loading: false,
          });
        }
      })
      .catch(() => {
        setLiturgiaPreview({
          texto: "Um trecho da Bíblia para refletir hoje.",
          referencia: "",
          cor: null,
          tempo: "",
          loading: false,
        });
      });

    santoService
      .buscarSantoDoDia()
      .then((santo) => {
        setSantoPreview({
          nome: santo.nome,
          titulo: santo.titulo,
          festa: santo.dia ?? "",
          loading: false,
        });
      })
      .catch(() => {
        setSantoPreview({
          nome: "",
          titulo: "",
          festa: "",
          loading: false,
        });
      });
  }, []);

  const intencoes = [
    { emoji: "🙏", label: "Quero rezar", path: "/prayers" },
    { emoji: "📖", label: "Quero aprender", path: "/liturgy" },
    { emoji: "💬", label: "Tenho dúvidas", path: "/catechist" },
    { emoji: "❤️", label: "Quero agradecer ou pedir algo", path: "/prayers" },
  ];

  // Scroll handler for header styling
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSilence, setShowSilence] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen pb-24 bg-background relative transition-colors duration-300">
      <div className="absolute top-0 left-0 right-0 h-[320px] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-background dark:via-background/95 dark:to-transparent pointer-events-none transition-colors duration-300" />
      {/* Header: ícones à esquerda (sparkle + saudação + 🙏), direita (chat, sino, perfil G) */}
      <header
        className={`sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-all duration-300 ${isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border py-3"
          : "bg-transparent"
          }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 flex-shrink-0 transition-colors ${isScrolled ? "text-foreground" : "text-white/90"}`} />
          <p className={`font-body text-xl font-medium tracking-tight transition-colors ${isScrolled ? "text-foreground" : "text-white"}`}>
            {greeting}, {userName}! 🙏
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Início", path: "/home" },
            { label: "Liturgia", path: "/liturgy" },
            { label: "Catequista", path: "/catechist" },
            { label: "Orações", path: "/prayers" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`font-medium text-sm transition-colors ${isScrolled
                ? "text-foreground hover:text-primary"
                : "text-white/80 hover:text-white"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/catechist")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isScrolled
              ? "text-foreground hover:bg-muted"
              : "text-white/80 hover:bg-white/10"
              }`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            type="button"
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isScrolled
              ? "text-foreground hover:bg-muted"
              : "text-white/80 hover:bg-white/10"
              }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-transparent" />
          </button>


          <ProfileMenu>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white dark:bg-primary text-primary-600 dark:text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md transition-colors duration-300"
            >
              {userName.charAt(0).toUpperCase()}
            </button>
          </ProfileMenu>
        </div>
      </header>

      <main className="p-4 space-y-4 md:p-8 md:space-y-8 max-w-7xl mx-auto relative z-10">
        {/* 1️⃣ HERO PRINCIPAL - céu/nuvens (back1) + texto à esquerda + Jesus à direita */}
        <Card
          className="overflow-hidden rounded-3xl border border-primary/20 shadow-lg relative min-h-[240px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[400px] bg-background-soft"
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{ backgroundImage: "url('/back1.png')" }}
          />
          <div className="relative z-10 px-4 py-12 md:px-10 md:py-16 lg:px-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-center sm:text-left">
            {/* Esquerda: título, subtítulo, CTA */}
            <div className="flex-1 space-y-3 sm:space-y-4 max-w-md mx-auto sm:mx-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-semibold text-primary leading-tight">
                Comece seu momento com Deus
              </h1>
              <p className="text-muted-foreground font-body text-sm sm:text-base md:text-lg leading-relaxed">
                Um passo simples para hoje
              </p>
              <Button
                size="lg"
                className="w-full sm:w-auto mx-auto sm:mx-0 bg-gradient-to-r from-accent-300 to-accent-500 hover:from-accent-400 hover:to-accent-600 text-accent-foreground dark:text-primary font-semibold text-base h-14 sm:h-16 px-8 sm:px-10 rounded-xl shadow-md border border-accent-400/50 transition-all duration-300"
                onClick={() => navigate("/prayers")}
              >
                <span className="mr-2">🙏</span>
                Rezar agora (3 minutos)
              </Button>
            </div>
          </div>
        </Card>

        {/* 1.5️⃣ ACTION BUTTONS: Estou Mal & Silêncio */}
        <div className="grid grid-cols-2 gap-3">
          <ImDownDrawer>
            <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-rose-100 shadow-sm hover:bg-rose-50 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-lg">❤️‍🩹</span>
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-foreground">Estou mal hoje</span>
                <span className="block text-[10px] text-muted-foreground">Receber apoio</span>
              </div>
            </button>
          </ImDownDrawer>

          <button
            onClick={() => setShowSilence(true)}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-sky-100 shadow-sm hover:bg-sky-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-lg">🤫</span>
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-foreground">Silêncio</span>
              <span className="block text-[10px] text-muted-foreground">Timer guiado</span>
            </div>
          </button>
        </div>

        <GuidedSilence open={showSilence} onOpenChange={setShowSilence} />

        {/* 2️⃣ EVANGELHO DO DIA - card branco com sombra */}
        <Card
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white/95 dark:bg-card/95 shadow-md border-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/back2.png')" }}
          onClick={() => navigate("/liturgy")}
        >
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-heading font-semibold text-primary">
                Evangelho de hoje
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/liturgy");
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                Ver tudo
              </button>
            </div>
            {liturgiaPreview.loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <p className="font-body text-foreground text-base line-clamp-3 leading-relaxed mb-4">
                {liturgiaPreview.texto}
              </p>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/liturgy");
              }}
              className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Ler com explicação simples
              <ChevronRight className="w-4 h-4" />
            </button>
            {liturgiaPreview.cor && COR_LITURGICA_SIGNIFICADO[liturgiaPreview.cor] && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Cor Litúrgica
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5 leading-relaxed">
                  {COR_LITURGICA_SIGNIFICADO[liturgiaPreview.cor].label}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                  {COR_LITURGICA_SIGNIFICADO[liturgiaPreview.cor].explicacao}
                </p>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground font-body flex items-start gap-1.5 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-primary/70 flex-shrink-0 mt-0.5" />
              A Liturgia é a leitura bíblica rezada todos os dias pela Igreja.
            </p>
          </div>
        </Card>

        {/* 3️⃣ MEU CAMINHO - Novo componente de hábito */}
        <MyPath />



        {/* 5️⃣ SANTO DO DIA - duas colunas: esquerda (santo + botão), direita (Liturgia + citação) */}
        {/* 5️⃣ SANTO DO DIA - Redesigned to match layout */}
        <Card
          className="overflow-hidden bg-cover bg-center hover:shadow-lg transition-shadow bg-amber-50/50 dark:bg-card/95 shadow-md border-0"
          style={{ backgroundImage: "url('/back-saint-light.png')" }} // Hypothetical background, using subtle variation or just color
          onClick={() => navigate("/santo")}
        >
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center">
            {/* Esquerda: Avatar + Nome */}
            <div className="flex-shrink-0 relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                {/* Placeholder image or specific saint image if available */}
                <img src="/saint-placeholder.png" alt="Santo do dia" className="w-full h-full object-cover" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }} />
                <div className="hidden w-full h-full items-center justify-center bg-primary/10">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">☁️</span>
            </div>

            {/* Meio: Informações */}
            <div className="flex-1 text-center md:text-left space-y-1">
              <p className="text-sm font-semibold text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                Santo de hoje 🕊️
              </p>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                {santoPreview.nome || "São Martinho"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{santoPreview.titulo || "Um exemplo de fé para se inspirar"}</p>

              <Button
                size="sm"
                className="mt-2 rounded-full px-6 bg-primary/20 hover:bg-primary/30 text-primary-900 border-0 shadow-none font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/santo");
                }}
              >
                Conhecer a história (1 min) <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Direita: Card Citação/Liturgia Light */}
            <div className="flex-1 w-full md:max-w-xs bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
              <div className="flex items-start gap-3 mb-3 pb-3 border-b border-black/5">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    A Liturgia é a leitura <span className="font-normal text-muted-foreground">bíblica rezada todos os dias pela Igreja.</span>
                  </p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                <span className="text-xl text-primary/40 mr-1">"</span>
                Eu era soldado de Cristo: não me é lícito lutar.
              </p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
