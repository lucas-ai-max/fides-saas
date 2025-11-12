import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Loader2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { liturgiaService, type LiturgiaDiaria } from '@/services/liturgiaService';
import { toast } from 'sonner';
import FontSizeControl from '@/components/FontSizeControl';
import { useFontSize } from '@/hooks/useFontSize';
import { BiblicalText } from '@/components/BiblicalText';

const LiturgiaDiaria = () => {
  const navigate = useNavigate();
  const { fontSize, setFontSize, config: fontConfig } = useFontSize();
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

  return (
    <div className="min-h-screen bg-background-secondary pb-24">
      {/* Header */}
      <header className="bg-card border-b border-gray-light sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-lg font-heading font-semibold text-text-primary">Liturgia Diária</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSalvar}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-light transition-colors"
              title={salvo ? 'Remover dos salvos' : 'Salvar liturgia'}
            >
              <Bookmark
                className={`w-5 h-5 ${salvo ? 'fill-accent text-accent' : 'text-gray-text'}`}
              />
            </button>
            <button
              onClick={handleCompartilhar}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-light transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-5 h-5 text-gray-text" />
            </button>
          </div>
        </div>

        {/* Info da Data e Controle de Fonte */}
        <div className="px-4 pb-3 pt-2 border-t border-gray-light">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-lg font-heading font-semibold text-primary capitalize">
                {liturgia.dia}
              </h2>
              <p className="text-sm text-gray-text mt-0.5">{liturgia.tempo}</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/20 flex-shrink-0">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {liturgiaService.getNomeCorLiturgica(liturgia.cor)}
            </div>
          </div>

          {/* Controle de Fonte */}
          <FontSizeControl
            currentSize={fontSize}
            onChange={setFontSize}
          />
        </div>
      </header>

      {/* Leituras */}
      <div className="px-4 pt-6 space-y-6">
        {liturgia.leituras.map((leitura, index) => {
          const isExpandido = leituraExpandida === leitura.tipo;
          const isEvangelho = leitura.tipo === 'evangelho';
          const isSalmo = leitura.tipo === 'salmo';

          return (
            <div
              key={index}
              className={`bg-card rounded-2xl overflow-hidden shadow-sm border transition-all ${
                isEvangelho 
                  ? 'border-primary/30 shadow-md relative' 
                  : 'border-gray-light'
              }`}
            >
              {/* Decoração para Evangelho */}
              {isEvangelho && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
              )}

              {/* Header da Leitura */}
              <button
                onClick={() => toggleLeitura(leitura.tipo)}
                className={`relative w-full px-5 py-4 flex items-center justify-between ${
                  isEvangelho 
                    ? 'bg-gradient-to-r from-primary to-primary-light' 
                    : isSalmo
                    ? 'bg-gradient-to-r from-purple-50 to-purple-100'
                    : 'bg-gradient-to-r from-blue-50 to-sky-50'
                } hover:brightness-95 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isEvangelho 
                      ? 'bg-white shadow-lg' 
                      : 'bg-white/80'
                  }`}>
                    <span className="text-xl">{icones[leitura.tipo]}</span>
                  </div>
                  <div className="text-left">
                    <h3 
                      className={`font-sans font-bold uppercase tracking-wider ${
                        isEvangelho ? 'text-white' : 'text-primary'
                      }`}
                      style={{ fontSize: fontConfig.title }}
                    >
                      {leitura.titulo}
                    </h3>
                    <p
                      className={`font-sans font-semibold mt-1 ${
                        isEvangelho ? 'text-accent-light' : 'text-accent-dark'
                      }`}
                      style={{ fontSize: fontConfig.reference }}
                    >
                      {leitura.referencia}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform flex-shrink-0 ${
                    isEvangelho ? 'text-white' : 'text-gray-text'
                  } ${isExpandido ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Texto da Leitura */}
              {isExpandido && (
                <div className={`px-6 py-7 ${
                  isEvangelho ? 'bg-white/90 backdrop-blur-sm relative' : 'bg-card'
                }`}>
                  <BiblicalText
                    text={leitura.texto}
                    fontSize={fontConfig.body}
                    lineHeight={fontConfig.lineHeight}
                  />
                </div>
              )}

              {/* Borda decorativa para Evangelho */}
              {isEvangelho && (
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reflexão */}
      {liturgia.reflexao && (
        <div className="mx-4 mt-6 mb-4 bg-gradient-to-br from-accent/5 to-accent-light/10 rounded-2xl overflow-hidden shadow-sm border border-accent/20">
          {/* Header */}
          <div className="px-5 py-4 border-b border-accent/20 bg-white/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <h3 
                className="font-sans font-bold uppercase tracking-wider text-accent-dark"
                style={{ fontSize: fontConfig.title }}
              >
                Reflexão do Dia
              </h3>
            </div>
          </div>

          {/* Texto */}
          <div className="px-6 py-7 bg-white/70">
            <BiblicalText
              text={liturgia.reflexao}
              fontSize={fontConfig.body}
              lineHeight={fontConfig.lineHeight}
              className="italic text-gray-800"
            />
          </div>
        </div>
      )}

      {/* Fonte */}
      <div className="px-4 pt-6 pb-6">
        <div className="bg-gray-light rounded-xl p-4 border border-gray-light">
          <p className="text-xs text-center text-gray-text">
            📖 Fonte: <span className="font-semibold">{liturgia.fonte}</span> (CNBB - Conferência
            Nacional dos Bispos do Brasil)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiturgiaDiaria;
