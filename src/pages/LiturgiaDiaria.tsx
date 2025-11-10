import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Loader2,
  ChevronDown,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { liturgiaService, type LiturgiaDiaria } from '@/services/liturgiaService';
import { toast } from 'sonner';

const LiturgiaDiaria = () => {
  const navigate = useNavigate();
  const [liturgia, setLiturgia] = useState<LiturgiaDiaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    const texto = `📿 Liturgia de ${liturgia.dia}

${liturgia.tempo}
Cor: ${liturgiaService.getDescricaoCorLiturgica(liturgia.cor)}

${evangelhoRef}

Acompanhe no app Fides - Fortalecendo sua jornada de fé`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Liturgia Diária',
          text: texto,
        });
      } else {
        await navigator.clipboard.writeText(texto);
        toast.success('Texto copiado para área de transferência!');
      }
    } catch (err) {
      console.log('Compartilhamento cancelado');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-foreground font-medium">Carregando liturgia da CNBB...</p>
        <p className="text-sm text-muted-foreground mt-2">Aguarde um momento</p>
      </div>
    );
  }

  if (error || !liturgia) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background px-4">
        <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-border">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Liturgia Indisponível</h2>
          <p className="text-muted-foreground mb-6">{error || 'Não foi possível carregar a liturgia'}</p>
          <button
            onClick={carregarLiturgia}
            className="w-full px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-3 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent/10 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const icones: Record<string, string> = {
    primeira: '📖',
    salmo: '♫',
    segunda: '✉️',
    evangelho: '✝️',
  };

  const coresHeader: Record<string, string> = {
    primeira: 'bg-blue-50 border-blue-200',
    salmo: 'bg-purple-50 border-purple-200',
    segunda: 'bg-green-50 border-green-200',
    evangelho: 'bg-gradient-to-r from-accent/10 to-accent/5 border-accent',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-serif font-semibold text-primary">Liturgia Diária</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSalvar}
              className="p-2 hover:bg-accent/10 rounded-full transition-colors"
              title={salvo ? 'Remover dos salvos' : 'Salvar liturgia'}
            >
              <Bookmark
                className={`w-5 h-5 ${salvo ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
              />
            </button>
            <button
              onClick={handleCompartilhar}
              className="p-2 hover:bg-accent/10 rounded-full transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Info da Data */}
        <div className="px-4 pb-4">
          <p className="text-lg font-serif font-semibold text-primary capitalize">
            {liturgia.dia}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{liturgia.tempo}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm font-medium text-foreground">Cor Litúrgica:</span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <span className="text-lg">{liturgiaService.getEmojiCor(liturgia.cor)}</span>
              <span className="text-sm font-semibold text-foreground">
                {liturgiaService.getNomeCorLiturgica(liturgia.cor)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Leituras */}
      <div className="px-4 pt-4 space-y-4">
        {liturgia.leituras.map((leitura, index) => {
          const isExpandido = leituraExpandida === leitura.tipo;
          const isEvangelho = leitura.tipo === 'evangelho';

          return (
            <div
              key={index}
              className={`bg-card rounded-xl border-2 overflow-hidden transition-all ${
                isEvangelho ? 'border-accent shadow-md' : 'border-border'
              }`}
            >
              {/* Header da Leitura */}
              <button
                onClick={() => toggleLeitura(leitura.tipo)}
                className={`w-full p-4 flex items-center justify-between ${
                  coresHeader[leitura.tipo] || 'bg-muted'
                } hover:brightness-95 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icones[leitura.tipo]}</span>
                  <div className="text-left">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">
                      {leitura.titulo}
                    </h3>
                    <p
                      className={`text-sm font-semibold ${
                        isEvangelho ? 'text-accent' : 'text-muted-foreground'
                      } mt-0.5`}
                    >
                      {leitura.referencia}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    isExpandido ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Texto da Leitura */}
              {isExpandido && (
                <div className="p-6 border-t border-border bg-card">
                  <p className="font-serif text-base leading-relaxed text-foreground whitespace-pre-line">
                    {leitura.texto}
                  </p>

                  <button className="mt-4 flex items-center gap-2 text-sm text-accent hover:text-accent/90 transition-colors font-medium">
                    <Volume2 className="w-4 h-4" />
                    <span>Ouvir leitura (em breve)</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reflexão */}
      {liturgia.reflexao && (
        <div className="mx-4 mt-6 mb-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💡</span>
            <h3 className="font-semibold text-primary text-lg">Reflexão do Dia</h3>
          </div>
          <p className="font-serif text-foreground leading-relaxed">{liturgia.reflexao}</p>
        </div>
      )}

      {/* Fonte */}
      <div className="px-4 pt-6 pb-6">
        <div className="bg-muted rounded-lg p-4 border border-border">
          <p className="text-xs text-center text-muted-foreground">
            📖 Fonte: <span className="font-semibold">{liturgia.fonte}</span> (CNBB - Conferência
            Nacional dos Bispos do Brasil)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiturgiaDiaria;
