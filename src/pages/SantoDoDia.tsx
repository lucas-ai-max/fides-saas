import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, Loader2, AlertCircle } from 'lucide-react';
import { santoService, SantoDoDia } from '@/services/santoService';
import { toast } from 'sonner';
import { BottomNav } from '@/components/BottomNav';

export default function SantoDoDiaPage() {
  const navigate = useNavigate();
  const [santo, setSanto] = useState<SantoDoDia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    carregarSanto();
    verificarSalvo();
  }, []);

  const carregarSanto = async () => {
    setCarregando(true);
    setErro(false);

    try {
      const dados = await santoService.buscarSantoDoDia();
      setSanto(dados);
    } catch (error) {
      console.error('Erro ao carregar santo:', error);
      setErro(true);
      toast.error('Erro ao carregar santo do dia');
    } finally {
      setCarregando(false);
    }
  };

  const verificarSalvo = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const salvos: string[] = JSON.parse(localStorage.getItem('santos_salvos') || '[]');
    setSalvo(salvos.includes(hoje));
  };

  const toggleSalvar = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const salvos: string[] = JSON.parse(localStorage.getItem('santos_salvos') || '[]');

    if (salvo) {
      const novos = salvos.filter((d) => d !== hoje);
      localStorage.setItem('santos_salvos', JSON.stringify(novos));
      setSalvo(false);
      toast.success('Santo removido dos favoritos');
    } else {
      salvos.push(hoje);
      localStorage.setItem('santos_salvos', JSON.stringify(salvos));
      setSalvo(true);
      toast.success('Santo salvo nos favoritos!');
    }
  };

  const compartilhar = async () => {
    if (!santo) return;

    const texto = `🕊️ Santo do Dia - ${santo.dia}\n\n${santo.nome}\n${santo.titulo}\n\n"${santo.historia.substring(0, 150)}..."\n\nConheça a história completa no app Fides! 🙏`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Santo do Dia - ${santo.nome}`,
          text: texto,
        });
        toast.success('Compartilhado com sucesso!');
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      await navigator.clipboard.writeText(texto);
      toast.success('Texto copiado para área de transferência!');
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-bold font-heading text-primary">Santo do Dia</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
          <p className="text-foreground font-medium">Carregando santo do dia...</p>
          <p className="text-muted-foreground text-sm mt-2">Aguarde alguns instantes</p>
        </div>
      </div>
    );
  }

  if (erro || !santo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-bold font-heading text-primary">Santo do Dia</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <p className="text-foreground font-semibold text-lg mb-2">Erro ao carregar</p>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            Não foi possível carregar o santo do dia. Verifique sua conexão com a internet.
          </p>
          <button
            onClick={carregarSanto}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-28">
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold font-heading text-primary">Santo do Dia</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleSalvar}
              className={`p-2 rounded-lg transition-colors ${
                salvo ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
              }`}
              aria-label={salvo ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            >
              <Bookmark className={`w-5 h-5 ${salvo ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={compartilhar}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-base">{santo.dia}</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-accent/20 via-primary/20 to-accent/10 p-12 flex items-center justify-center">
            <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center shadow-xl border-4 border-card">
              <span className="text-7xl">🕊️</span>
            </div>
          </div>

          <div className="p-6 text-center border-b border-border">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-2">
              {santo.nome}
            </h2>
            {santo.titulo && (
              <p className="text-accent font-semibold text-lg">{santo.titulo}</p>
            )}
          </div>

          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold font-heading text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">📖</span>
              História
            </h3>
            <p className="text-foreground leading-relaxed text-justify whitespace-pre-wrap">
              {santo.historia}
            </p>
          </div>

          {santo.oracao && (
            <div className="p-6 bg-gradient-to-br from-accent/5 via-primary/5 to-accent/5">
              <h3 className="text-lg font-bold font-heading text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">🙏</span>
                Oração
              </h3>
              <div className="bg-card/50 rounded-lg p-4 border border-accent/20">
                <p className="text-foreground leading-relaxed italic whitespace-pre-wrap text-justify">
                  {santo.oracao}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground mb-4">
          📚 Fonte: {santo.fonte}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
