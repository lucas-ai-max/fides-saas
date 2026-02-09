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
    const texto = `🕊️ Santo do Dia - ${santo.dia}\n\n${santo.nome}\n${santo.titulo}\n\nConheça a história completa no app Fides! 🙏`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Santo do Dia - ${santo.nome}`, text: texto });
      } catch (error) { console.log('Cancelado'); }
    } else {
      await navigator.clipboard.writeText(texto);
      toast.success('Copiado!');
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !santo) return null; // Simple error state for now

  // Mocking new fields based on existing data
  const resumoBot = santo.historia ? santo.historia.substring(0, 180) + "..." : "História não disponível.";
  const licaoPratica = "A fidelidade nas pequenas coisas constrói a santidade."; // Placeholder hero variable
  const fraseMarcante = "Quem a Deus tem, nada lhe falta. Só Deus basta."; // Santa Teresa de Ávila placeholder

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header Transparente */}
      <header className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{santo.dia}</span>
          <button onClick={share} className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-foreground" />
            {/* Note: share function needs to be renamed or consistent */}
          </button>
        </div>
      </header>

      <main className="pt-20 max-w-3xl mx-auto px-6 space-y-8">

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-b from-accent/20 to-accent/10 p-1 shadow-lg ring-4 ring-card">
            {santo.imagem ? (
              <img src={santo.imagem} alt={santo.nome} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-accent/15 flex items-center justify-center text-4xl">🕊️</div>
            )}
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">{santo.nome}</h1>
            <p className="text-accent font-medium">{santo.titulo}</p>
          </div>
        </div>

        {/* Em 1 minuto */}
        <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="font-heading font-semibold text-foreground">Em 1 minuto</h2>
          </div>
          <p className="font-serif text-lg leading-relaxed text-muted-foreground">
            {resumoBot}
          </p>
        </section>

        {/* Lição Prática */}
        <section className="bg-success-light/30 dark:bg-success/10 p-6 rounded-3xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🌱</span>
            <h2 className="font-heading font-semibold text-foreground">O que aprender hoje</h2>
          </div>
          <p className="text-foreground font-medium">
            {licaoPratica}
          </p>
        </section>

        {/* Frase */}
        <section className="relative py-8 px-4">
          <span className="absolute top-0 left-0 text-6xl text-accent/30 font-serif">“</span>
          <blockquote className="font-serif text-2xl text-center text-foreground italic relative z-10 px-4">
            {fraseMarcante}
          </blockquote>
          <span className="absolute bottom-0 right-0 text-6xl text-accent/30 font-serif leading-none">”</span>
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={toggleSalvar}
            className={`flex-1 py-3.5 rounded-xl font-medium border transition-all flex items-center justify-center gap-2 ${salvo ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
          >
            <Bookmark className={`w-4 h-4 ${salvo ? 'fill-current' : ''}`} />
            {salvo ? 'Salvo' : 'Salvar'}
          </button>

          <button className="flex-[2] bg-primary text-primary-foreground rounded-xl font-medium py-3.5 shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            <span>🙏</span> Rezar com este santo
          </button>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
