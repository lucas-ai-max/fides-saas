import { ArrowLeft, Lock, Calendar, Church } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExame } from '@/hooks/useExame';
import { BottomNav } from '@/components/BottomNav';

const ExameConsciencia = () => {
  const navigate = useNavigate();
  const { storage, getDaysSinceLastExam } = useExame();
  const daysSince = getDaysSinceLastExam();

  return (
    <div className="min-h-screen bg-secondary-bg pb-28">
      {/* Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-secondary-bg rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="flex-1 text-center font-serif text-2xl text-primary font-semibold">
            Exame de Consciência
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Card Introdutório */}
        <div className="bg-gradient-to-br from-[#4A5D7C] to-[#6B4C7C] rounded-3xl p-8 text-white">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🕊️</span>
            </div>
            <h2 className="font-serif text-3xl font-semibold">
              Preparação para a Confissão
            </h2>
            <p className="text-white/90 text-lg max-w-md">
              Um momento de reflexão honesta diante de Deus
            </p>
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Totalmente privado e sem salvamento de dados
              </span>
            </div>
          </div>
        </div>

        {/* Card de Método */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-serif text-2xl font-semibold text-primary">
                  10 Mandamentos
                </h3>
                <p className="text-secondary text-sm">
                  Revisão tradicional baseada na Lei de Deus
                </p>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span>⏱️ 15-20 minutos</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/examination/realizar')}
              className="w-full mt-6 bg-accent text-primary font-semibold py-4 rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Exame
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-3 text-secondary">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">
              {daysSince !== null
                ? `Último exame: há ${daysSince} ${daysSince === 1 ? 'dia' : 'dias'}`
                : 'Nenhum exame realizado ainda'}
            </span>
          </div>
          {storage.lastConfessionDate && (
            <div className="flex items-center gap-3 text-secondary">
              <Church className="w-5 h-5" />
              <span className="text-sm">
                Última confissão: {new Date(storage.lastConfessionDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('/home')}
            className="text-primary text-sm font-medium hover:underline"
          >
            Encontrar confessionário próximo →
          </button>
        </div>

        {/* Aviso de Privacidade */}
        <div className="bg-success/10 border border-success/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-success font-medium text-sm">
                Seus dados são privados e não são salvos.
              </p>
              <p className="text-success/80 text-xs">
                Nenhuma informação sai do seu dispositivo. Apenas a data do último exame é
                armazenada localmente para fins estatísticos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ExameConsciencia;
