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

const LiturgiaDiaria = () => {
  const navigate = useNavigate();
  // Simplified font size state for "Reader Mode" (S, M, L)
  // We can map these to specific px values or scale factors
  const [readerSize, setReaderSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showReaderMenu, setShowReaderMenu] = useState(false);

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

  // Font size mapping
  const getFontSizeClass = () => {
    switch (readerSize) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      default: return 'text-base';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-sky-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-primary-700 font-serif">Carregando a Palavra...</p>
      </div>
    );
  }

  if (error || !liturgia) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-sky-50 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif font-semibold text-gray-800 mb-2">Liturgia Indisponível</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={carregarLiturgia}>Tentar Novamente</Button>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-2">Voltar</Button>
      </div>
    );
  }

  // Icons mapping for the new design
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'primeira': return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'segunda': return <BookOpen className="w-6 h-6 text-blue-600" />;
      case 'salmo': return <Music className="w-6 h-6 text-sky-600" />;
      case 'evangelho': return <Cross className="w-6 h-6 text-indigo-600" />; // Using Cross as generic, ideally specific cross icon
      default: return <BookOpen className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen relative bg-[#F0F9FF] pb-32">
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
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-serif text-lg font-medium text-gray-800">Liturgia Diária</h1>
          <div className="w-9 h-9" /> {/* Spacer */}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-6 space-y-6">

        {/* Top Info Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/40">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-500">📅</span>
                <span className="font-heading font-semibold text-lg text-gray-800">{liturgia.dia}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{liturgia.tempo}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${liturgia.cor.includes('verde') ? 'bg-green-500' :
                    liturgia.cor.includes('roxo') ? 'bg-purple-500' :
                      liturgia.cor.includes('vermelho') ? 'bg-red-500' :
                        liturgia.cor.includes('branco') ? 'bg-slate-100' :
                          liturgia.cor.includes('rosa') ? 'bg-pink-500' :
                            'bg-gray-500'
                    }`} />
                  Cor: {liturgiaService.getNomeCorLiturgica(liturgia.cor)}
                </span>
              </div>
            </div>

            {/* Reader Comfort Control */}
            <div className="relative">
              <button
                onClick={() => setShowReaderMenu(!showReaderMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Conforto
                <ChevronDown className="w-3 h-3" />
              </button>

              {showReaderMenu && (
                <div className="absolute right-0 top-full mt-2 p-2 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[160px] animate-in fade-in zoom-in-95">
                  <p className="text-[10px] items-center text-gray-400 font-medium px-2 mb-2 uppercase tracking-wider">Tamanho da fonte</p>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['sm', 'base', 'lg'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setReaderSize(size as any)}
                        className={`flex-1 py-1.5 rounded-md text-center text-sm font-medium transition-all ${readerSize === size ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {size === 'sm' ? 'A' : size === 'base' ? 'M' : 'A+'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 italic border-t border-gray-100 pt-4">
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
            let cardStyle = "bg-white/80 border-white/50";
            let headerBg = "bg-transparent";

            if (isEvangelho) {
              cardStyle = "bg-blue-50/80 border-blue-100 shadow-md ring-1 ring-blue-100";
              headerBg = "bg-gradient-to-r from-blue-100/50 to-transparent";
            } else if (isSalmo) {
              cardStyle = "bg-gradient-to-b from-sky-50/80 to-white/80 border-sky-100";
            }

            return (
              <div key={index} className={`rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-500 border ${cardStyle}`}>
                <button
                  onClick={() => toggleLeitura(leitura.tipo)}
                  className={`w-full text-left p-5 flex items-start justify-between gap-4 ${headerBg}`}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isEvangelho ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                      }`}>
                      {getIcon(leitura.tipo)}
                    </div>
                    <div>
                      <h3 className={`font-serif text-lg font-semibold leading-tight ${isEvangelho ? 'text-blue-900' : 'text-gray-800'}`}>
                        {leitura.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${isEvangelho ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {leitura.referencia}
                        </span>
                        {isSalmo && <span className="text-xs text-gray-400 italic">Rezamos este salmo em resposta</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`p-1 rounded-full bg-black/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </button>

                {/* Content */}
                {isExpanded && (
                  <div className="px-6 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                    <div className={`prose prose-gray max-w-none font-serif leading-relaxed text-gray-700 ${getFontSizeClass()}`}>
                      <BiblicalText
                        text={leitura.texto}
                        fontSize={`${readerSize === 'sm' ? '14px' : readerSize === 'lg' ? '20px' : '17px'}`}
                      />
                    </div>

                    {isEvangelho && (
                      <div className="mt-8 flex justify-center">
                        <span className="text-blue-300">✦ ✦ ✦</span>
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
          <div className="bg-amber-50/60 backdrop-blur-sm rounded-3xl p-6 border border-amber-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <CloudSun className="w-32 h-32 text-amber-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <span className="text-xl">🕯️</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-amber-900">Reflexão do Dia</h3>
                  <p className="text-xs text-amber-700">(Este texto nos ajuda a meditar a liturgia)</p>
                </div>
              </div>

              <div className={`font-serif text-amber-900/80 leading-relaxed ${getFontSizeClass()}`}>
                <BiblicalText
                  text={liturgia.reflexao}
                  fontSize={`${readerSize === 'sm' ? '14px' : readerSize === 'lg' ? '20px' : '17px'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Closing Section */}
        <div className="py-12 text-center space-y-6">
          <div className="space-y-1">
            <p className="font-serif text-xl text-gray-600 font-medium">Quer ficar alguns instantes em silêncio?</p>
            <p className="text-gray-400 text-sm">Ou agradeça a Deus por este momento.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            {/* Primary Action */}
            <button
              onClick={() => navigate('/prayers')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3.5 px-6 font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <HandHeart className="w-5 h-5" />
              Fazer uma oração
            </button>

            {/* Secondary Action */}
            <button
              onClick={handleSalvar}
              className={`flex-1 bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 px-6 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${salvo ? 'text-amber-600 border-amber-200 bg-amber-50' : ''}`}
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
