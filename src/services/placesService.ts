interface LocalizacaoUsuario {
  latitude: number;
  longitude: number;
  precisao?: number;
}

interface IgrejaCatolica {
  id: string;
  nome: string;
  endereco: string;
  distancia?: number;
  distanciaFormatada?: string;
  latitude: number;
  longitude: number;
  denominacao?: string;
  website?: string;
  telefone?: string;
  horarios?: string;
  descricao?: string;
  paroquia?: string;
  rating?: number;
  userRatingCount?: number;
  isOpenNow?: boolean;
}

class PlacesService {
  private readonly GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  private readonly RAIO_BUSCA = 10000; // 10km em metros
  private cache: Map<string, { data: IgrejaCatolica[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  /**
   * Obtém localização atual do usuário
   */
  async obterLocalizacaoUsuario(): Promise<LocalizacaoUsuario> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      console.log('📍 Solicitando permissão de localização...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const localizacao: LocalizacaoUsuario = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            precisao: position.coords.accuracy,
          };
          console.log('✅ Localização obtida:', localizacao);
          resolve(localizacao);
        },
        (error) => {
          console.error('❌ Erro ao obter localização:', error);
          let mensagem = 'Não foi possível obter sua localização';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensagem = 'Permissão de localização negada. Ative nas configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              mensagem = 'Localização indisponível no momento.';
              break;
            case error.TIMEOUT:
              mensagem = 'Tempo esgotado ao tentar obter localização.';
              break;
          }

          reject(new Error(mensagem));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Busca igrejas católicas próximas usando Google Places API
   */
  async buscarIgrejasProximas(
    localizacao?: LocalizacaoUsuario,
    raio?: number
  ): Promise<IgrejaCatolica[]> {
    try {
      if (!this.GOOGLE_API_KEY) {
        throw new Error('Chave da API do Google Maps não configurada (.env)');
      }

      const loc = localizacao || (await this.obterLocalizacaoUsuario());
      const raioFinal = raio || this.RAIO_BUSCA;

      // Verificar cache
      const cacheKey = `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)},${raioFinal}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('📦 Igrejas do cache (Google)');
        return cached.data;
      }

      console.log(`🔍 Buscando igrejas no Google Places (raio: ${(raioFinal / 1000).toFixed(1)}km)...`);

      const igrejas = await this.buscarNoGooglePlaces(loc, raioFinal);

      // Salvar no cache
      this.cache.set(cacheKey, {
        data: igrejas,
        timestamp: Date.now(),
      });

      console.log(`✅ ${igrejas.length} igrejas encontradas no Google`);
      return igrejas;
    } catch (error) {
      console.error('❌ Erro ao buscar igrejas:', error);
      throw error;
    }
  }

  /**
   * Busca usando Google Places API (New)
   */
  private async buscarNoGooglePlaces(
    localizacao: LocalizacaoUsuario,
    raio: number
  ): Promise<IgrejaCatolica[]> {
    const url = 'https://places.googleapis.com/v1/places:searchNearby';

    // Campos que queremos retornar
    // https://developers.google.com/maps/documentation/places/web-service/place-field-support
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.types',
      'places.nationalPhoneNumber',
      'places.websiteUri',
      'places.rating',
      'places.userRatingCount',
      'places.currentOpeningHours',
      'places.businessStatus'
    ].join(',');

    const requestBody = {
      includedTypes: ['church', 'catholic_church', 'place_of_worship'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: localizacao.latitude,
            longitude: localizacao.longitude,
          },
          radius: raio,
        },
      },
      // Opcional: filtrar apenas católicas se possível ou filtrar no client
      // Google places types: "catholic_church" existe? Sim, mas nem todas estão marcadas assim.
      // Vamos pegar 'church' e filtrar por nome se necessário, ou confiar no resultado.
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.GOOGLE_API_KEY,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Erro Google API: ${response.status} - ${err}`);
      }

      const data = await response.json();

      if (!data.places || data.places.length === 0) {
        return [];
      }

      // Filtrar e transformar
      let services = data.places.map((place: any) => this.transformarGooglePlace(place, localizacao));

      // Filtragem extra de segurança para garantir que é católico
      // O Google retorna "church", mas pode vir evangélica. Vamos tentar filtrar por nome/tipo.
      // O tipo 'catholic_church' ajuda, mas se não tiver, olhamos o nome.
      services = services.filter((igreja: IgrejaCatolica) => this.ehProvavelCatolica(igreja, data.places.find((p: any) => p.id === igreja.id)));

      // Ordenar por distância
      services.sort((a: IgrejaCatolica, b: IgrejaCatolica) => (a.distancia || 0) - (b.distancia || 0));

      return services;
    } catch (error) {
      console.error('Erro na requisição Google Places:', error);
      throw error;
    }
  }

  private transformarGooglePlace(place: any, localizacao: LocalizacaoUsuario): IgrejaCatolica {
    const lat = place.location.latitude;
    const lng = place.location.longitude;
    const distancia = this.calcularDistancia(localizacao.latitude, localizacao.longitude, lat, lng);

    return {
      id: place.id,
      nome: place.displayName?.text || 'Igreja',
      endereco: place.formattedAddress || 'Endereço não disponível',
      latitude: lat,
      longitude: lng,
      distancia: distancia,
      distanciaFormatada: this.formatarDistancia(distancia),
      telefone: place.nationalPhoneNumber,
      website: place.websiteUri,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      isOpenNow: place.currentOpeningHours?.openNow,
      horarios: place.currentOpeningHours?.openNow ? 'Aberto agora' : (place.currentOpeningHours ? 'Fechado' : undefined),
      denominacao: this.inferirDenominacao(place),
    };
  }

  private inferirDenominacao(place: any): string {
    const types = place.types || [];
    if (types.includes('catholic_church')) return 'Católica';
    return 'Igreja';
  }

  private ehProvavelCatolica(igreja: IgrejaCatolica, rawPlace: any): boolean {
    const types = rawPlace.types || [];
    if (types.includes('catholic_church')) return true;

    const nomeLower = igreja.nome.toLowerCase();

    // Termos que indicam fortemente católica
    const termosCatolicos = [
      'paróquia', 'paroquia', 'catedral', 'basílica', 'basilica',
      'santuário', 'santuario', 'nossa senhora', 'são ', 'santa ', 'santo ',
      'matriz', 'católica', 'catolica', 'capela'
    ];

    // Termos que indicam NÃO católica (evangélica/protestante)
    const termosNaoCatolicos = [
      'assembléia', 'assembleia', 'batista', 'universal', 'evangélica', 'evangelica',
      'presbiteriana', 'adventista', 'metodista', 'pentecostal', 'deus é amor',
      'renascer', 'bola de neve', 'luterana', 'congregacional', 'quadrangular',
      'internacional da graça', 'mundial', 'testemunhas de jeová', 'mórmon'
    ];

    if (termosNaoCatolicos.some(t => nomeLower.includes(t))) return false;
    if (termosCatolicos.some(t => nomeLower.includes(t))) return true;

    // Se estiver em dúvida (apenas "Igreja ..."), mantemos por padrão se veio da busca "church", 
    // mas o risco de falso positivo existe.
    return true;
  }

  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  }

  private formatarDistancia(metros: number): string {
    if (metros < 1000) {
      return `${Math.round(metros)} m`;
    }
    return `${(metros / 1000).toFixed(1)} km`;
  }

  abrirNavegacao(igreja: IgrejaCatolica): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${igreja.latitude},${igreja.longitude}`;
    window.open(url, '_blank');
  }

  abrirNoMapa(igreja: IgrejaCatolica): void {
    // Usar Google Maps já que temos a API
    const url = `https://www.google.com/maps/search/?api=1&query=${igreja.latitude},${igreja.longitude}&query_place_id=${igreja.id}`;
    window.open(url, '_blank');
  }

  async compartilharIgreja(igreja: IgrejaCatolica): Promise<void> {
    const texto = `⛪ ${igreja.nome}\n📍 ${igreja.endereco}\n🗺️ https://www.google.com/maps/search/?api=1&query=${igreja.latitude},${igreja.longitude}&query_place_id=${igreja.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: igreja.nome,
          text: texto,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      await navigator.clipboard.writeText(texto);
    }
  }

  limparCache(): void {
    this.cache.clear();
    console.log('🧹 Cache de lugares limpo');
  }
}

export const placesService = new PlacesService();
export type { IgrejaCatolica, LocalizacaoUsuario };
