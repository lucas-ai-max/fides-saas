import { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exameData } from '@/data/exameConsciencia';
import { exameAIService } from '@/services/exameAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PecadoIdentificado {
  mandamentoNumero: number;
  mandamentoTitulo: string;
  perguntas: string[];
}

const RealizarExame = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [identifications, setIdentifications] = useState<Record<string, boolean>>({});
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const currentMandamento = exameData[currentIndex];
  const progress = ((currentIndex + 1) / exameData.length) * 100;

  useEffect(() => {
    return () => {
      exameAIService.resetThread();
    };
  }, []);

  const handleExit = () => {
    if (window.confirm('Tem certeza que deseja sair? Seu progresso não será salvo.')) {
      exameAIService.resetThread();
      navigate('/examination');
    }
  };

  const handleNext = () => {
    if (currentIndex < exameData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAI(false);
      setAiMessages([]);
    } else {
      // Coletar pecados identificados
      const pecadosIdentificados: PecadoIdentificado[] = [];
      
      Object.entries(identifications).forEach(([mandamentoId, identificou]) => {
        if (identificou) {
          const mandamento = exameData.find(m => m.id === mandamentoId);
          if (mandamento) {
            pecadosIdentificados.push({
              mandamentoNumero: mandamento.numero,
              mandamentoTitulo: mandamento.mandamento,
              perguntas: mandamento.questions,
            });
          }
        }
      });

      navigate('/examination/conclusao', { state: { pecadosIdentificados } });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAI(false);
      setAiMessages([]);
    }
  };

  const handleIdentification = (value: boolean) => {
    setIdentifications({ ...identifications, [currentMandamento.id]: value });
  };

  const handleSendAI = async () => {
    if (!userInput.trim() || isLoadingAI) return;

    const userMessage = userInput;
    setUserInput('');
    setAiMessages([...aiMessages, { role: 'user', content: userMessage }]);
    setIsLoadingAI(true);

    try {
      const response = await exameAIService.sendMessage(userMessage);
      setAiMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Erro ao comunicar com IA:', error);
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' },
      ]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-bg flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Sair</span>
            </button>
            <button className="p-2 text-secondary hover:text-primary transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-secondary-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-secondary text-center">
              {currentIndex + 1}/{exameData.length} Mandamentos
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-6 pb-32">
          {/* Seção do Mandamento */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-semibold text-primary">
              {currentMandamento.numero > 0 ? `${currentMandamento.numero}º Mandamento` : 'Mandamentos da Igreja'}
            </h2>
            <p className="font-serif italic text-xl text-accent">
              {currentMandamento.mandamento}
            </p>
          </div>

          {/* Card de Perguntas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-primary">Reflita sobre:</h3>
            <ul className="space-y-3">
              {currentMandamento.questions.map((question, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-secondary mt-1">•</span>
                  <span className="text-[#2C2C2C] leading-relaxed">{question}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* IA Auxiliadora */}
          <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl transition-all ${showAI ? 'p-0' : 'p-4'}`}>
            {!showAI ? (
              <div className="flex items-start gap-3">
                <span className="text-2xl">✝️</span>
                <div className="flex-1 space-y-3">
                  <p className="font-medium text-primary">Precisa de ajuda para entender algo?</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAI(true)}
                    className="w-full"
                  >
                    Conversar com Auxiliador
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[400px]">
                {/* Header do Chat */}
                <div className="bg-blue-100 px-4 py-3 border-b border-blue-200 rounded-t-xl flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary">Auxiliador de Exame</h4>
                    <p className="text-xs text-secondary flex items-center gap-1">
                      <span>🔒</span>
                      Sem histórico • Totalmente privado
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAI(false);
                      setAiMessages([]);
                    }}
                    className="p-1 hover:bg-blue-200 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                  <div className="bg-secondary-bg rounded-lg p-3">
                    <p className="text-sm text-secondary">
                      Olá! Estou aqui para ajudar você a entender melhor as perguntas do exame de
                      consciência. Suas perguntas não são salvas. Como posso ajudar?
                    </p>
                  </div>
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-primary text-white ml-auto'
                          : 'bg-secondary-bg text-secondary'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                  {isLoadingAI && (
                    <div className="bg-secondary-bg rounded-lg p-3 max-w-[85%] flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-secondary">Pensando...</span>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-blue-200 bg-white rounded-b-xl">
                  <div className="flex gap-2">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAI();
                        }
                      }}
                      placeholder="Digite sua dúvida..."
                      className="resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendAI}
                      disabled={!userInput.trim() || isLoadingAI}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <p className="text-xs text-secondary">
                      Esta conversa não substitui a direção espiritual ou o Sacramento da
                      Confissão.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Identificação */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-primary">Identifiquei algo a confessar?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleIdentification(true)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  identifications[currentMandamento.id] === true
                    ? 'bg-primary text-white'
                    : 'border-2 border-border text-secondary hover:border-primary'
                }`}
              >
                ✓ Sim
              </button>
              <button
                onClick={() => handleIdentification(false)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  identifications[currentMandamento.id] === false
                    ? 'bg-primary text-white'
                    : 'border-2 border-border text-secondary hover:border-primary'
                }`}
              >
                ○ Não
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-border shadow-lg">
        <div className="max-w-3xl mx-auto p-4 flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <Button onClick={handleNext} className="flex items-center gap-2 bg-accent text-primary hover:bg-accent/90">
            {currentIndex === exameData.length - 1 ? 'Concluir' : 'Próximo'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealizarExame;
