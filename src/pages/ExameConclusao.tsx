import { useState } from 'react';
import { Check, Lock, Copy, Download, Edit3, ChevronRight, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExame } from '@/hooks/useExame';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { gerarPDFExame } from '@/utils/gerarPDFExame';

interface PecadoIdentificado {
  mandamentoNumero: number;
  mandamentoTitulo: string;
  perguntas: string[];
}

const ExameConclusao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeExam } = useExame();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const pecadosIdentificados: PecadoIdentificado[] = location.state?.pecadosIdentificados || [];

  const handleCopiar = async () => {
    let textoParaCopiar = '📿 EXAME DE CONSCIÊNCIA\n\n';

    if (pecadosIdentificados.length > 0) {
      textoParaCopiar += 'ÁREAS DE REFLEXÃO:\n\n';
      
      pecadosIdentificados.forEach((pecado) => {
        const mandamentoTexto = pecado.mandamentoNumero > 0 
          ? `${pecado.mandamentoNumero}º MANDAMENTO`
          : 'MANDAMENTOS DA IGREJA';
        textoParaCopiar += `${mandamentoTexto} - ${pecado.mandamentoTitulo}\n`;
        textoParaCopiar += 'Perguntas para reflexão:\n';
        pecado.perguntas.forEach((pergunta) => {
          textoParaCopiar += `• ${pergunta}\n`;
        });
        textoParaCopiar += '\n';
      });
    } else {
      textoParaCopiar += 'Nenhum pecado identificado neste momento.\n\n';
    }

    textoParaCopiar += '═══════════════════════════════\n\n';
    textoParaCopiar += '🙏 ATO DE CONTRIÇÃO\n\n';
    textoParaCopiar += 'Meu Deus, eu me arrependo, de todo o coração, de todos os meus pecados, e os detesto, porque, pecando, ofendi a Vós que sois o sumo Bem e digno de ser amado sobre todas as coisas.\n\n';
    textoParaCopiar += 'Proponho firmemente, com a ajuda da vossa graça, nunca mais pecar e fugir das ocasiões próximas de pecado.\n\n';
    textoParaCopiar += 'Senhor, tende piedade de mim, pecador. Ámen.\n\n';
    textoParaCopiar += '═══════════════════════════════\n\n';
    textoParaCopiar += 'Gerado pelo app Fides - Fortalecendo sua jornada de fé\n';

    try {
      await navigator.clipboard.writeText(textoParaCopiar);
      
      toast.success('Texto copiado!', {
        description: 'Cole em suas anotações ou editor de texto',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar texto. Tente novamente.');
    }
  };

  const handleBaixarPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      gerarPDFExame(pecadosIdentificados);
      
      toast.success('PDF gerado com sucesso!', {
        description: 'O arquivo foi baixado para seu dispositivo',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleComplete = () => {
    completeExam();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto p-4 space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary">Exame Concluído</h1>
          <p className="text-secondary text-base">Prepare-se para a Confissão</p>
        </div>

        {/* Resumo de Pecados */}
        {pecadosIdentificados.length > 0 ? (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Resumo para Confissão
              </h2>
            </div>

            <p className="text-sm text-secondary mb-4">
              Você identificou áreas de reflexão nos seguintes mandamentos:
            </p>

            <div className="space-y-3">
              {pecadosIdentificados.map((pecado) => (
                <div 
                  key={`${pecado.mandamentoNumero}-${pecado.mandamentoTitulo}`}
                  className="bg-secondary-bg rounded-lg p-4 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {pecado.mandamentoNumero > 0 ? pecado.mandamentoNumero : '✝'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {pecado.mandamentoNumero > 0 
                          ? `${pecado.mandamentoNumero}º Mandamento`
                          : 'Mandamentos da Igreja'}
                      </h3>
                      <p className="text-sm text-accent italic mb-3">
                        {pecado.mandamentoTitulo}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Perguntas para reflexão:
                        </p>
                        {pecado.perguntas.map((pergunta, idx) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <span className="text-accent text-xs mt-1">•</span>
                            <p className="text-sm text-foreground leading-relaxed">
                              {pergunta}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800">
                💡 <strong>Dica:</strong> Leve esta lista ao confessionário para não esquecer nada importante.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Consciência em Paz
              </h3>
              <p className="text-sm text-secondary">
                Você não identificou pecados a confessar neste momento. Continue cultivando sua vida espiritual com oração e os sacramentos.
              </p>
            </div>
          </div>
        )}

        {/* Ato de Contrição */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🙏</span>
            <h2 className="text-xl font-semibold text-foreground">
              Ato de Contrição
            </h2>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white">
            <p className="font-serif text-base leading-relaxed italic text-center">
              "Meu Deus, eu me arrependo, de todo o coração, de todos os meus pecados, e os detesto,
              porque, pecando, ofendi a Vós que sois o sumo Bem e digno de ser amado sobre todas as
              coisas.
            </p>
            <p className="font-serif text-base leading-relaxed italic text-center mt-4">
              Proponho firmemente, com a ajuda da vossa graça, nunca mais pecar e fugir das
              ocasiões próximas de pecado.
            </p>
            <p className="font-serif text-base leading-relaxed italic text-center mt-4 font-semibold">
              Senhor, tende piedade de mim, pecador. Ámen."
            </p>
          </div>
        </div>

        {/* Ações de Exportação */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Levar para Confissão
          </h3>

          <div className="space-y-3">
            {/* Botão Copiar */}
            <button
              onClick={handleCopiar}
              className="w-full bg-white border-2 border-border rounded-lg p-4 flex items-center justify-between hover:border-primary hover:bg-secondary-bg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Copy className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Copiar Texto</p>
                  <p className="text-xs text-muted-foreground">Copiar para área de transferência</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Botão Baixar PDF */}
            <button
              onClick={handleBaixarPDF}
              disabled={isGeneratingPDF}
              className="w-full bg-accent text-primary rounded-lg p-4 flex items-center justify-between hover:bg-accent-light transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {isGeneratingPDF ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold">Baixar PDF</p>
                  <p className="text-xs opacity-80">Arquivo para imprimir ou salvar</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-60" />
            </button>

            {/* Botão Anotar em Papel */}
            <button
              onClick={handleComplete}
              className="w-full bg-white border border-border rounded-lg p-4 flex items-center justify-between hover:bg-secondary-bg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-bg rounded-full flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Anotar em Papel</p>
                  <p className="text-xs text-muted-foreground">Escrever manualmente</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Próximo Passo - Confessionário */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⛪</span>
            <h3 className="text-lg font-semibold text-foreground">
              Próximo Passo
            </h3>
          </div>

          <p className="text-sm text-secondary mb-4">
            Procure um confessionário em uma igreja próxima para celebrar o Sacramento da Reconciliação.
          </p>

          <Button
            onClick={() => {
              completeExam();
              navigate('/home');
            }}
            className="w-full"
          >
            🔍 Encontrar Confessionário Próximo
          </Button>
        </div>
      </div>

      {/* Footer: Aviso de Privacidade */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-50 border-t border-green-200 p-4 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-800">
            <strong>Privacidade garantida:</strong> Nenhuma informação foi salva em nossos servidores. Após sair desta página, tudo será apagado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExameConclusao;
