import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Navigation,
  Loader2,
  ChevronRight,
  Clock,
  Church,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { igrejasService, Igreja } from '@/services/igrejasService';
import { toast } from 'sonner';

const Igrejas = () => {
  const navigate = useNavigate();

  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroRaio, setFiltroRaio] = useState(5);
  const [localizacaoAtual, setLocalizacaoAtual] = useState('Carregando...');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      buscarIgrejas();
    }
  }, [filtroRaio]);

  const carregarDados = async () => {
    try {
      // Obter localização atual
      const endereco = await igrejasService.obterEnderecoAtual();
      setLocalizacaoAtual(endereco);

      // Buscar igrejas
      await buscarIgrejas();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const buscarIgrejas = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await igrejasService.buscarIgrejasProximas(filtroRaio);
      setIgrejas(resultado);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirecoes = (igreja: Igreja) => {
    const url = igrejasService.obterDirecoesURL(igreja);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-secondary">
      {/* Header */}
      <header className="bg-white border-b border-borders-light px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-secondary rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-serif font-semibold text-primary">
            Igrejas Próximas
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <MapPin className="w-4 h-4 text-accent" />
          <span>{localizacaoAtual}</span>
        </div>
      </header>

      {/* Filtro de Raio */}
      <div className="bg-white border-b border-borders-light px-4 py-4">
        <label className="text-sm font-medium text-text-primary mb-3 block">
          Raio de busca: <span className="text-accent font-semibold">{filtroRaio} km</span>
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={filtroRaio}
          onChange={(e) => setFiltroRaio(Number(e.target.value))}
          className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-xs text-text-tertiary mt-2">
          <span>1 km</span>
          <span>10 km</span>
          <span>20 km</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="text-text-secondary text-center">Buscando igrejas próximas...</p>
            <p className="text-sm text-text-tertiary mt-1">Isso pode levar alguns segundos</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Erro ao buscar igrejas</h3>
            <p className="text-text-secondary text-center mb-6">{error}</p>
            <button
              onClick={carregarDados}
              className="px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent-light transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : igrejas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
              <Church className="w-8 h-8 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Nenhuma igreja encontrada</h3>
            <p className="text-text-secondary text-center mb-2">
              Não encontramos igrejas católicas em um raio de {filtroRaio} km
            </p>
            <p className="text-sm text-text-tertiary mb-6">
              Tente aumentar o raio de busca
            </p>
            <button
              onClick={() => setFiltroRaio(Math.min(filtroRaio + 5, 20))}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
            >
              Aumentar Raio para {Math.min(filtroRaio + 5, 20)} km
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {igrejas.length} {igrejas.length === 1 ? 'igreja encontrada' : 'igrejas encontradas'}
              </h2>
              <span className="text-sm text-text-tertiary">
                Ordenadas por distância
              </span>
            </div>

            <div className="space-y-4 pb-6">
              {igrejas.map((igreja, index) => (
                <div
                  key={igreja.id}
                  className="bg-white rounded-xl border border-borders-light overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-4">
                    {/* Header do Card */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary mb-1 leading-tight">
                          {igreja.nome}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-accent">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">{igreja.distancia} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="mb-3">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {igreja.endereco}
                      </p>
                    </div>

                    {/* Horários (se disponível) */}
                    {(igreja.horarios?.missas || igreja.horarios?.confissao || igreja.horarios?.abertura) && (
                      <div className="mb-3 p-3 bg-bg-secondary rounded-lg">
                        {igreja.horarios.abertura && (
                          <div className="flex items-start gap-2 mb-2">
                            <Clock className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-text-secondary">Horário:</p>
                              <p className="text-xs text-text-secondary">{igreja.horarios.abertura}</p>
                            </div>
                          </div>
                        )}
                        {igreja.horarios.missas && igreja.horarios.missas.length > 0 && (
                          <div className="flex items-start gap-2 mb-2">
                            <Church className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-text-secondary">Missas:</p>
                              <p className="text-xs text-text-secondary">
                                {igreja.horarios.missas.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                        {igreja.horarios.confissao && igreja.horarios.confissao.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="text-text-tertiary text-xs mt-0.5">✝️</span>
                            <div>
                              <p className="text-xs font-medium text-text-secondary">Confissões:</p>
                              <p className="text-xs text-text-secondary">
                                {igreja.horarios.confissao.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contatos */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {igreja.telefone && (
                        <a
                          href={`tel:${igreja.telefone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-info/10 text-info rounded-lg text-xs font-medium hover:bg-info/20 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{igreja.telefone}</span>
                        </a>
                      )}
                      {igreja.website && (
                        <a
                          href={igreja.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Website</span>
                        </a>
                      )}
                    </div>

                    {/* Botão de Direções */}
                    <button
                      onClick={() => handleDirecoes(igreja)}
                      className="w-full bg-accent text-primary py-3 rounded-lg font-semibold hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>Como Chegar</span>
                      <ChevronRight className="w-5 h-5 ml-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Igrejas;
