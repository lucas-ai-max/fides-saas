import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  Globe,
  Clock,
  Loader2,
  AlertCircle,
  Share2,
  Church,
  ExternalLink,
} from 'lucide-react';
import { placesService, IgrejaCatolica } from '../services/placesService';
import { toast } from 'sonner';
import { BottomNav } from '@/components/BottomNav';

// Detecta se é dispositivo móvel
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Abre mapa usando JavaScript (evita bloqueio CORS)
const abrirMapa = (igreja: IgrejaCatolica, tipo: 'directions' | 'view') => {
  const { latitude, longitude } = igreja;

  let url = '';

  if (tipo === 'directions') {
    if (isMobile()) {
      url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      window.location.href = url;
    } else {
      // URL simplificada do Google Maps para desktop
      url = `https://maps.google.com/?daddr=${latitude},${longitude}`;

      const win = window.open(url, '_blank', 'noopener,noreferrer');

      // Fallback se bloqueado por popup blocker
      if (!win || win.closed || typeof win.closed == 'undefined') {
        window.location.href = url;
      }
    }
  } else {
    if (isMobile()) {
      url = `geo:${latitude},${longitude}`;
      window.location.href = url;
    } else {
      // OpenStreetMap funciona melhor para visualização
      url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=18`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
};

export default function IgrejasProximas() {
  const navigate = useNavigate();
  const [igrejas, setIgrejas] = useState<IgrejaCatolica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [raio, setRaio] = useState<number>(10000); // 10km padrão

  useEffect(() => {
    carregarIgrejas();
  }, [raio]);

  const carregarIgrejas = async () => {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await placesService.buscarIgrejasProximas(undefined, raio);
      setIgrejas(resultado);

      if (resultado.length === 0) {
        toast.info('Nenhuma igreja encontrada nos arredores');
      } else {
        toast.success(`${resultado.length} igrejas encontradas!`);
      }
    } catch (error: any) {
      console.error('Erro ao carregar igrejas:', error);
      setErro(error.message || 'Erro ao buscar igrejas próximas');
      toast.error(error.message || 'Erro ao buscar igrejas');
    } finally {
      setCarregando(false);
    }
  };

  const navegarPara = (igreja: IgrejaCatolica) => {
    placesService.abrirNavegacao(igreja);
    toast.success(`Abrindo rota para ${igreja.nome}`);
  };

  const verNoMapa = (igreja: IgrejaCatolica) => {
    placesService.abrirNoMapa(igreja);
  };

  const compartilhar = async (igreja: IgrejaCatolica) => {
    try {
      await placesService.compartilharIgreja(igreja);
      toast.success('Igreja compartilhada!');
    } catch (error) {
      toast.success('Link copiado para área de transferência!');
    }
  };

  // LOADING STATE
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent/10 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-crimson">Igrejas Próximas</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
          <p className="text-foreground font-medium">Buscando igrejas próximas...</p>
          <p className="text-muted-foreground text-sm mt-2">Buscando no Google Maps...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent/10 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-crimson">Igrejas Próximas</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <p className="text-foreground font-semibold text-lg mb-2">Erro ao buscar igrejas</p>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">{erro}</p>
          <button
            onClick={carregarIgrejas}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // CONTEÚDO PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-crimson">Igrejas Próximas</h1>
          <button
            onClick={carregarIgrejas}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            aria-label="Atualizar"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Seletor de Raio */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-foreground mb-2">
            Raio de busca
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setRaio(5000)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${raio === 5000
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              5 km
            </button>
            <button
              onClick={() => setRaio(10000)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${raio === 10000
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              10 km
            </button>
            <button
              onClick={() => setRaio(15000)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${raio === 15000
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              15 km
            </button>
          </div>
        </div>
      </div>

      {/* Contador */}
      <div className="max-w-2xl mx-auto px-4 mt-4 mb-4">
        <div className="bg-card rounded-lg p-4 shadow-sm text-center">
          <p className="text-muted-foreground">
            <span className="font-bold text-accent text-2xl">{igrejas.length}</span>{' '}
            {igrejas.length === 1 ? 'igreja católica encontrada' : 'igrejas católicas encontradas'}
          </p>
          <p className="text-muted-foreground text-sm mt-1">Raio de {raio / 1000}km</p>
        </div>
      </div>

      {/* Lista de Igrejas */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-4">
          {igrejas.map((igreja, index) => (
            <div
              key={igreja.id}
              className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Header do Card */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Church className="w-5 h-5 text-primary" />
                      <span className="text-xs font-semibold text-primary">
                        #{index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-crimson text-primary">
                      {igreja.nome}
                    </h3>
                    {igreja.paroquia && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Paróquia: {igreja.paroquia}
                      </p>
                    )}
                  </div>
                  {igreja.distanciaFormatada && (
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-bold">
                        {igreja.distanciaFormatada}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-5">
                {/* Endereço */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
                    <span>{igreja.endereco}</span>
                  </p>
                </div>

                {/* Denominação */}
                {igreja.denominacao && (
                  <div className="mb-3">
                    <p className="text-sm text-foreground flex items-center gap-2">
                      <span className="text-lg">✝️</span>
                      <span className="font-medium">{igreja.denominacao}</span>
                    </p>
                  </div>
                )}

                {/* Horários */}
                {igreja.horarios && (
                  <div className="mb-3">
                    <p className="text-sm text-foreground flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>{igreja.horarios}</span>
                    </p>
                  </div>
                )}

                {/* Descrição */}
                {igreja.descricao && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground italic">{igreja.descricao}</p>
                  </div>
                )}

                {/* Contatos */}
                {(igreja.telefone || igreja.website) && (
                  <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b">
                    {igreja.telefone && (
                      <a
                        href={`tel:${igreja.telefone}`}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {igreja.telefone}
                      </a>
                    )}
                    {igreja.website && (
                      <a
                        href={igreja.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                )}

                {/* Botões de Ação - Versão Visual */}
                <div className="space-y-3">
                  {/* Card Principal - Ver no Mapa */}
                  <a
                    href={`https://www.openstreetmap.org/#map=18/${igreja.latitude}/${igreja.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-lg">Ver no Mapa</p>
                        <p className="text-sm text-green-100">Abrir localização no Google Maps</p>
                      </div>
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </a>

                  {/* Grid de Ações Rápidas */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Copiar Coordenadas */}
                    <button
                      onClick={async () => {
                        const coords = `${igreja.latitude}, ${igreja.longitude}`;
                        try {
                          await navigator.clipboard.writeText(coords);
                          toast.success('📍 Coordenadas copiadas!', {
                            description: 'Cole no Google Maps ou Waze'
                          });
                        } catch (error) {
                          toast.error('Erro ao copiar');
                        }
                      }}
                      className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-colors"
                    >
                      <div className="text-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-blue-900">Copiar</p>
                        <p className="text-xs text-blue-600">Coordenadas</p>
                      </div>
                    </button>

                    {/* Copiar Endereço */}
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(igreja.endereco);
                          toast.success('📮 Endereço copiado!');
                        } catch (error) {
                          toast.error('Erro ao copiar');
                        }
                      }}
                      className="p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-colors"
                    >
                      <div className="text-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-purple-900">Copiar</p>
                        <p className="text-xs text-purple-600">Endereço</p>
                      </div>
                    </button>
                  </div>

                  {/* Dica de Uso */}
                  <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                    <div className="flex gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          Como navegar até lá:
                        </p>
                        <p className="text-xs text-amber-800">
                          Clique em "Copiar Coordenadas", abra o Google Maps ou Waze no seu celular,
                          cole as coordenadas na busca e inicie a navegação.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Links diretos (tentar abrir) */}
                  <details className="mt-3">
                    <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground font-medium">
                      ⚙️ Tentar abrir em outros apps
                    </summary>
                    <div className="mt-2 space-y-2">
                      {/* Google Maps */}
                      <a
                        href={`geo:${igreja.latitude},${igreja.longitude}`}
                        className="block w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-center text-sm font-medium no-underline"
                      >
                        🗺️ Tentar Google Maps
                      </a>

                      {/* Waze */}
                      <a
                        href={`waze://?ll=${igreja.latitude},${igreja.longitude}&navigate=yes`}
                        className="block w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-center text-sm font-medium no-underline"
                      >
                        🚗 Tentar Waze
                      </a>

                      {/* Apple Maps */}
                      <a
                        href={`maps://?daddr=${igreja.latitude},${igreja.longitude}`}
                        className="block w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium no-underline"
                      >
                        🍎 Tentar Apple Maps
                      </a>
                    </div>
                  </details>
                </div>

                {/* Botão Compartilhar */}
                <button
                  onClick={() => compartilhar(igreja)}
                  className="w-full mt-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem se não houver igrejas */}
        {igrejas.length === 0 && (
          <div className="text-center py-12">
            <Church className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold mb-2">Nenhuma igreja encontrada</p>
            <p className="text-muted-foreground text-sm mb-4">
              Não encontramos igrejas católicas registradas em um raio de {raio / 1000}km
            </p>
            {raio < 15000 && (
              <p className="text-muted-foreground text-sm">
                💡 Tente aumentar o raio de busca acima
              </p>
            )}
          </div>
        )}

        {/* Footer Informativo */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">
            Dados fornecidos por <strong>Google Maps</strong> 🗺️
            <br />
            Maior precisão e cobertura
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
