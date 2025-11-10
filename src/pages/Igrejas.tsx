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
  Star,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { igrejasService, Igreja } from '@/services/igrejasService';

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

      if (resultado.length === 0) {
        setError(`Nenhuma igreja católica encontrada em ${filtroRaio} km. Tente aumentar o raio.`);
      }
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
      <header className="bg-background border-b border-border px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-serif font-semibold text-primary">Igrejas Próximas</h1>
          <div className="w-10" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-accent" />
          <span>{localizacaoAtual}</span>
        </div>
      </header>

      {/* Filtro de Raio */}
      <div className="bg-background border-b border-border px-4 py-4">
        <label className="text-sm font-medium text-foreground mb-3 block">
          Raio de busca: <span className="text-accent font-semibold">{filtroRaio} km</span>
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={filtroRaio}
          onChange={(e) => setFiltroRaio(Number(e.target.value))}
          disabled={loading}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
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
            <p className="text-foreground text-center font-medium">Buscando igrejas próximas...</p>
            <p className="text-sm text-muted-foreground mt-1">Aguarde alguns segundos</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
              {igrejas.length === 0 && filtroRaio < 20 ? 'Nenhuma igreja encontrada' : 'Erro'}
            </h3>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            {igrejas.length === 0 && filtroRaio < 20 ? (
              <button
                onClick={() => setFiltroRaio(Math.min(filtroRaio + 5, 20))}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Aumentar Raio para {Math.min(filtroRaio + 5, 20)} km
              </button>
            ) : (
              <button
                onClick={carregarDados}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {igrejas.length} {igrejas.length === 1 ? 'igreja encontrada' : 'igrejas encontradas'}
              </h2>
            </div>

            <div className="space-y-4 pb-6">
              {igrejas.map((igreja, index) => (
                <div
                  key={igreja.id}
                  className="bg-background rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Foto */}
                  {igreja.fotos && igreja.fotos.length > 0 && (
                    <div className="relative h-48 bg-muted">
                      <img
                        src={igreja.fotos[0]}
                        alt={igreja.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {igreja.fotos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {igreja.fotos.length}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 leading-tight">
                          {igreja.nome}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1 text-sm text-accent">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{igreja.distancia} km</span>
                          </div>
                          {igreja.rating && (
                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium">{igreja.rating.toFixed(1)}</span>
                              {igreja.totalAvaliacoes && (
                                <span className="text-muted-foreground text-xs">({igreja.totalAvaliacoes})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <p className="text-sm text-muted-foreground mb-3">{igreja.endereco}</p>

                    {/* Horários */}
                    {igreja.horarios && (
                      <div className="mb-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className={`text-xs font-semibold ${
                            igreja.horarios.status === 'Aberto agora' ? 'text-green-600' : 'text-destructive'
                          }`}>
                            {igreja.horarios.status}
                          </span>
                        </div>
                        {igreja.horarios.horarioHoje && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">{igreja.horarios.horarioHoje}</p>
                        )}
                      </div>
                    )}

                    {/* Contatos */}
                    <div className="flex gap-2 mb-3">
                      {igreja.telefone && (
                        <a
                          href={`tel:${igreja.telefone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Ligar
                        </a>
                      )}
                      {igreja.website && (
                        <a
                          href={igreja.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Site
                        </a>
                      )}
                    </div>

                    {/* Direções */}
                    <button
                      onClick={() => handleDirecoes(igreja)}
                      className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Como Chegar
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
