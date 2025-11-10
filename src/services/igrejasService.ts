interface Igreja {
  id: string;
  nome: string;
  endereco: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  distancia: number; // em km
  latitude: number;
  longitude: number;
  telefone?: string;
  website?: string;
  rating?: number;
  totalAvaliacoes?: number;
  categorias?: string[];
  fotos?: string[];
  horarios?: {
    status?: string;
    horarioHoje?: string;
    todos?: any;
  };
  fonte: 'foursquare' | 'openstreetmap';
}

interface Coordenadas {
  lat: number;
  lng: number;
}

class IgrejasService {
  private readonly API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;
  private readonly BASE_URL = 'https://api.foursquare.com/v3';
  private userLocation: Coordenadas | null = null;
  private usandoFallback = false;
  private cache: Map<string, { data: Igreja[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  // Obtém localização do usuário
  async getUserLocation(): Promise<Coordenadas> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.userLocation = coords;
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao buscar localização. Tente novamente.';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  // Busca igrejas (tenta Foursquare, se falhar usa OSM)
  async buscarIgrejasProximas(raioKm: number = 5): Promise<Igreja[]> {
    if (!this.userLocation) {
      this.userLocation = await this.getUserLocation();
    }

    // Verificar cache
    const cacheKey = `${this.userLocation.lat},${this.userLocation.lng}-${raioKm}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('✓ Usando dados do cache');
      this.usandoFallback = cached.data[0]?.fonte === 'openstreetmap';
      return cached.data;
    }

    try {
      // Tenta Foursquare primeiro
      const igrejas = await this.buscarFoursquare(raioKm);
      this.usandoFallback = false;
      
      // Salvar no cache
      this.cache.set(cacheKey, { data: igrejas, timestamp: Date.now() });
      
      return igrejas;
    } catch (error: any) {
      console.warn('⚠️ Foursquare falhou, usando OpenStreetMap:', error.message);
      
      // Se Foursquare falhar, usa OpenStreetMap
      this.usandoFallback = true;
      const igrejas = await this.buscarOpenStreetMap(raioKm);
      
      // Salvar no cache
      this.cache.set(cacheKey, { data: igrejas, timestamp: Date.now() });
      
      return igrejas;
    }
  }

  // Busca usando Foursquare API
  private async buscarFoursquare(raioKm: number): Promise<Igreja[]> {
    if (!this.userLocation) {
      throw new Error('Localização não disponível');
    }

    const url = new URL(`${this.BASE_URL}/places/search`);
    url.searchParams.append('ll', `${this.userLocation.lat},${this.userLocation.lng}`);
    url.searchParams.append('radius', (raioKm * 1000).toString());
    url.searchParams.append('categories', '12060');
    url.searchParams.append('limit', '50');
    url.searchParams.append(
      'fields',
      'fsq_id,name,location,distance,geocodes,tel,website,rating,stats,categories,hours,photos'
    );

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: this.API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API Key inválida ou expirada');
      } else if (response.status === 403) {
        throw new Error('Acesso negado à API');
      } else if (response.status === 429) {
        throw new Error('Limite de requisições excedido');
      } else {
        throw new Error(`Erro na API: ${response.status}`);
      }
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('Nenhum resultado encontrado');
    }

    const igrejasCatolicas = data.results.filter((place: any) => 
      this.ehIgrejaCatolica(place.name)
    );

    const igrejas: Igreja[] = igrejasCatolicas.map((place: any) => {
      const coords = {
        lat: place.geocodes?.main?.latitude || 0,
        lng: place.geocodes?.main?.longitude || 0,
      };

      const distancia = this.calcularDistancia(this.userLocation!, coords);

      return {
        id: place.fsq_id,
        nome: place.name,
        endereco: place.location?.formatted_address || this.formatarEndereco(place.location),
        cidade: place.location?.locality,
        estado: place.location?.region,
        cep: place.location?.postcode,
        distancia: distancia,
        latitude: coords.lat,
        longitude: coords.lng,
        telefone: place.tel,
        website: place.website,
        rating: place.rating,
        totalAvaliacoes: place.stats?.total_ratings,
        categorias: place.categories?.map((c: any) => c.name),
        fotos: place.photos?.map((p: any) => this.getFotoURL(p)),
        horarios: this.formatarHorarios(place.hours),
        fonte: 'foursquare' as const,
      };
    });

    igrejas.sort((a, b) => a.distancia - b.distancia);
    return igrejas;
  }

  // Busca usando OpenStreetMap (Overpass API) - FALLBACK GRATUITO
  private async buscarOpenStreetMap(raioKm: number): Promise<Igreja[]> {
    if (!this.userLocation) {
      throw new Error('Localização não disponível');
    }

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"]
          (around:${raioKm * 1000},${this.userLocation.lat},${this.userLocation.lng});
        way["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"]
          (around:${raioKm * 1000},${this.userLocation.lat},${this.userLocation.lng});
        relation["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"]
          (around:${raioKm * 1000},${this.userLocation.lat},${this.userLocation.lng});
      );
      out body center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do OpenStreetMap');
    }

    const data = await response.json();

    if (!data.elements || data.elements.length === 0) {
      return [];
    }

    const igrejas = data.elements.map((element: any) => {
      const lat = element.lat || element.center?.lat || 0;
      const lng = element.lon || element.center?.lon || 0;
      const distancia = this.calcularDistancia(
        this.userLocation!,
        { lat, lng }
      );

      const tags = element.tags || {};
      const endereco = [
        tags['addr:street'],
        tags['addr:housenumber'],
        tags['addr:suburb'] || tags['addr:district'],
        tags['addr:city'],
      ]
        .filter(Boolean)
        .join(', ') || 'Endereço não disponível';

      return {
        id: `osm-${element.id}`,
        nome: tags.name || 'Igreja Católica',
        endereco,
        cidade: tags['addr:city'],
        estado: tags['addr:state'],
        cep: tags['addr:postcode'],
        distancia: parseFloat(distancia.toFixed(1)),
        latitude: lat,
        longitude: lng,
        telefone: tags['contact:phone'] || tags.phone,
        website: tags['contact:website'] || tags.website,
        fonte: 'openstreetmap' as const,
      };
    });

    igrejas.sort((a, b) => a.distancia - b.distancia);
    return igrejas;
  }

  // Verifica se o nome indica igreja católica
  private ehIgrejaCatolica(nome: string): boolean {
    const nomeLower = nome.toLowerCase();
    const termosCatolicos = [
      'católica',
      'catolica',
      'paróquia',
      'paroquia',
      'matriz',
      'capela',
      'basílica',
      'basilica',
      'catedral',
      'santuário',
      'santuario',
      'nossa senhora',
      'são ',
      'santa ',
      'santo ',
      'n. s.',
      'n.s.',
    ];

    return termosCatolicos.some(termo => nomeLower.includes(termo));
  }

  private getFotoURL(photo: any): string {
    if (!photo || !photo.prefix || !photo.suffix) return '';
    return `${photo.prefix}500x500${photo.suffix}`;
  }

  private formatarEndereco(location: any): string {
    if (!location) return 'Endereço não disponível';
    const partes: string[] = [];
    if (location.address) partes.push(location.address);
    if (location.locality && location.region) {
      partes.push(`${location.locality} - ${location.region}`);
    }
    if (location.postcode) partes.push(`CEP ${location.postcode}`);
    return partes.length > 0 ? partes.join(', ') : 'Endereço não disponível';
  }

  private formatarHorarios(hours: any): Igreja['horarios'] | undefined {
    if (!hours || !hours.display) return undefined;
    return {
      status: hours.open_now ? 'Aberto agora' : 'Fechado',
      horarioHoje: hours.display,
      todos: hours.regular || [],
    };
  }

  private calcularDistancia(coord1: Coordenadas, coord2: Coordenadas): number {
    const R = 6371;
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  obterDirecoesURL(igreja: Igreja): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${igreja.latitude},${igreja.longitude}`;
  }

  async obterEnderecoAtual(): Promise<string> {
    try {
      if (!this.userLocation) {
        this.userLocation = await this.getUserLocation();
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${this.userLocation.lat}&lon=${this.userLocation.lng}&format=json`,
        { headers: { 'User-Agent': 'Fides App' } }
      );

      const data = await response.json();
      const cidade = data.address?.city || data.address?.town || data.address?.village;
      const estado = data.address?.state;

      return cidade && estado ? `${cidade}, ${estado}` : 'Localização atual';
    } catch (error) {
      return 'Localização atual';
    }
  }

  // Indica se está usando fallback
  estáUsandoFallback(): boolean {
    return this.usandoFallback;
  }
}

export const igrejasService = new IgrejasService();
export type { Igreja, Coordenadas };
