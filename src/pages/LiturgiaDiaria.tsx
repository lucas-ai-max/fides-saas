import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Loader2,
  ChevronDown,
  AlertCircle,
  Eye,
  Type,
  MoreHorizontal,
  BookOpen,
  Music,
  Cross,
  CloudSun,
  HandHeart, // Using as "Praying Hands" alternative
  Bookmark,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { liturgiaService, type LiturgiaDiaria } from '@/services/liturgiaService';
import { toast } from 'sonner';
import { useFontSize } from '@/hooks/useFontSize';
import { BiblicalText } from '@/components/BiblicalText';
import { Button } from '@/components/ui/button';
import FontSizeControl from '@/components/FontSizeControl';

const LiturgiaDiaria = () => {
  const navigate = useNavigate();
  const { fontSize, setFontSize, config } = useFontSize();

  const [liturgia, setLiturgia] = useState<LiturgiaDiaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controls which reading is expanded. 'evangelho' is default expanded per design emphasis
  const [leituraExpandida, setLeituraExpandida] = useState<string | null>('evangelho');
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    carregarLiturgia();
    verificarSalvo();
  }, []);

  const carregarLiturgia = async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await liturgiaService.buscarLiturgiaDoDia();
      setLiturgia(dados);
    } catch (err: any) {
      console.error('Erro ao carregar liturgia:', err);
      setError(err.message || 'Erro ao carregar liturgia do dia');
    } finally {
      setLoading(false);
    }
  };

  const verificarSalvo = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const salvos = JSON.parse(localStorage.getItem('liturgias_salvas') || '[]');
    setSalvo(salvos.includes(hoje));
  };

  const toggleLeitura = (tipo: string) => {
    setLeituraExpandida(leituraExpandida === tipo ? null : tipo);
  };

  const handleSalvar = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const salvos = JSON.parse(localStorage.getItem('liturgias_salvas') || '[]');

    if (salvo) {
      const novos = salvos.filter((d: string) => d !== hoje);
      localStorage.setItem('liturgias_salvas', JSON.stringify(novos));
      setSalvo(false);
      toast.success('Liturgia removida dos salvos');
    } else {
      salvos.push(hoje);
      localStorage.setItem('liturgias_salvas', JSON.stringify(salvos));
      setSalvo(true);
      toast.success('Liturgia salva com sucesso!');
    }
  };

  const handleCompartilhar = async () => {
    if (!liturgia) return;
    const evangelhoRef = liturgia.leituras.find((l) => l.tipo === 'evangelho')?.referencia || '';
    const texto = `📿 Liturgia de ${liturgia.dia}\n\n${liturgia.tempo}\nCor: ${liturgiaService.getDescricaoCorLiturgica(liturgia.cor)}\n\n${evangelhoRef}\n\nAcompanhe no app Fides`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Liturgia Diária', text: texto });
      } else {
        await navigator.clipboard.writeText(texto);
        toast.success('Copiado para área de transferência!');
      }
    } catch (err) {
      console.log('Compartilhamento cancelado');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-foreground font-sans">Carregando a Palavra...</p>
      </div>
    );
  }

  if (error || !liturgia) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background px-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-sans font-semibold text-foreground mb-2">Liturgia Indisponível</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={carregarLiturgia}>Tentar Novamente</Button>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-2">Voltar</Button>
      </div>
    );
  }

  // Icons mapping for the new design
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'primeira': return <BookOpen className="w-6 h-6 text-primary" />;
      case 'segunda': return <BookOpen className="w-6 h-6 text-primary" />;
      case 'salmo': return <Music className="w-6 h-6 text-primary" />;
      case 'evangelho': return <Cross className="w-6 h-6 text-primary" />;
      default: return <BookOpen className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen relative bg-background pb-32">
      {/* Background Clouds Texture (Simulated with absolute div) */}
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url('/back1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Header Fixed */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-sans text-lg font-medium text-foreground">Liturgia Diária</h1>
          <div className="w-9 h-9" /> {/* Spacer */}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-6 space-y-6">

        {/* Top Info Card */}
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">📅</span>
                <span className="font-heading font-semibold text-lg text-foreground">{liturgia.dia}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{liturgia.tempo}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${liturgia.cor.includes('verde') ? 'bg-liturgical-green' :
                    liturgia.cor.includes('roxo') ? 'bg-liturgical-purple' :
                      liturgia.cor.includes('vermelho') ? 'bg-liturgical-red' :
                        liturgia.cor.includes('branco') ? 'bg-muted' :
                          liturgia.cor.includes('rosa') ? 'bg-accent' :
                            'bg-muted-foreground'
                  }`} />
                  Cor: {liturgiaService.getNomeCorLiturgica(liturgia.cor)}
                </span>
              </div>
            </div>

            {/* Controle de tamanho da fonte (useFontSize + FontSizeControl) */}
            <FontSizeControl currentSize={fontSize} onChange={setFontSize} />
          </div>
          <p className="text-sm text-muted-foreground italic border-t border-border pt-4">
            "Leia com calma. Não é preciso entender tudo."
          </p>
        </div>

        {/* Readings */}
        <div className="space-y-4">
          {liturgia.leituras.map((leitura, index) => {
            const isEvangelho = leitura.tipo === 'evangelho';
            const isSalmo = leitura.tipo === 'salmo';
            const isExpanded = leituraExpandida === leitura.tipo;

            // Visual styles based on type
            let cardStyle = "bg-card/80 border-border";
            let headerBg = "bg-transparent";

            if (isEvangelho) {
              cardStyle = "bg-primary/10 border-primary/20 shadow-md ring-1 ring-primary/20";
              headerBg = "bg-gradient-to-r from-primary/10 to-transparent";
            } else if (isSalmo) {
              cardStyle = "bg-gradient-to-b from-primary/5 to-card/80 border-border";
            }

            return (
              <div key={index} className={`rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-500 border ${cardStyle}`}>
                <button
                  onClick={() => toggleLeitura(leitura.tipo)}
                  className={`w-full text-left p-5 flex items-start justify-between gap-4 ${headerBg}`}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isEvangelho ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-border'
                      }`}>
                      {getIcon(leitura.tipo)}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
                        {leitura.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${isEvangelho ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                          {leitura.referencia}
                        </span>
                        {isSalmo && <span className="text-xs text-muted-foreground italic">Rezamos este salmo em resposta</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`p-1 rounded-full bg-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>

                {/* Content */}
                {isExpanded && (
                  <div className="px-6 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="prose prose-inherit max-w-none font-serif leading-loose text-foreground">
                      <BiblicalText
                        text={leitura.texto}
                        fontSize={config.body}
                        lineHeight={config.lineHeight}
                      />
                    </div>

                    {isEvangelho && (
                      <div className="mt-8 flex justify-center">
                        <span className="text-muted-foreground">✦ ✦ ✦</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reflection */}
        {liturgia.reflexao && (
          <div className="bg-accent/10 backdrop-blur-sm rounded-3xl p-6 border border-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <CloudSun className="w-32 h-32 text-accent" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center text-accent">
                  <span className="text-xl">🕯️</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">Reflexão do Dia</h3>
                  <p className="text-xs text-muted-foreground">(Este texto nos ajuda a meditar a liturgia)</p>
                </div>
              </div>

              <div className="font-serif text-foreground leading-loose">
                <BiblicalText
                  text={liturgia.reflexao}
                  fontSize={config.body}
                  lineHeight={config.lineHeight}
                />
              </div>
            </div>
          </div>
        )}

        {/* Closing Section */}
        <div className="py-12 text-center space-y-6">
          <div className="space-y-1">
            <p className="font-sans text-xl text-muted-foreground font-medium">Quer ficar alguns instantes em silêncio?</p>
            <p className="text-muted-foreground text-sm font-sans">Ou agradeça a Deus por este momento.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            {/* Primary Action */}
            <button
              onClick={() => navigate('/prayers')}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3.5 px-6 font-medium shadow-lg shadow-primary/20 hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <HandHeart className="w-5 h-5" />
              Fazer uma oração
            </button>

            {/* Secondary Action */}
            <button
              onClick={handleSalvar}
              className={`flex-1 bg-card border border-border text-foreground rounded-xl py-3.5 px-6 font-medium hover:bg-muted transition-all flex items-center justify-center gap-2 ${salvo ? 'text-accent border-accent/30 bg-accent/10' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${salvo ? 'fill-current' : ''}`} />
              {salvo ? 'Salvo' : 'Salvar este dia'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LiturgiaDiaria;
