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
}

interface Coordenadas {
  lat: number;
  lng: number;
}

class IgrejasService {
  private readonly API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;
  private readonly BASE_URL = 'https://api.foursquare.com/v3';
  private userLocation: Coordenadas | null = null;

  constructor() {
    if (!this.API_KEY) {
      console.error('⚠️ Foursquare API Key não configurada!');
    }
  }

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
              errorMessage = 'Permissão de localização negada. Ative nas configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível no momento.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao buscar localização.';
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

  // Busca igrejas católicas próximas
  async buscarIgrejasProximas(raioKm: number = 5): Promise<Igreja[]> {
    try {
      if (!this.API_KEY) {
        throw new Error('API Key do Foursquare não configurada');
      }

      if (!this.userLocation) {
        this.userLocation = await this.getUserLocation();
      }

      const { lat, lng } = this.userLocation;
      const raioMetros = raioKm * 1000;

      const url = new URL(`${this.BASE_URL}/places/search`);
      url.searchParams.append('ll', `${lat},${lng}`);
      url.searchParams.append('radius', raioMetros.toString());
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
        throw new Error(`Erro ao buscar igrejas: ${response.status}`);
      }

      const data = await response.json();

      const igrejasCatolicas = data.results.filter((place: any) => {
        const nome = place.name?.toLowerCase() || '';
        return (
          nome.includes('católica') ||
          nome.includes('catolica') ||
          nome.includes('paróquia') ||
          nome.includes('paroquia') ||
          nome.includes('matriz') ||
          nome.includes('catedral') ||
          nome.includes('basílica') ||
          nome.includes('basilica') ||
          nome.includes('santuário') ||
          nome.includes('santuario') ||
          nome.includes('capela')
        );
      });

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
        };
      });

      igrejas.sort((a, b) => a.distancia - b.distancia);
      return igrejas;
    } catch (error: any) {
      console.error('❌ Erro ao buscar igrejas:', error);
      throw error;
    }
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
}

export const igrejasService = new IgrejasService();
export type { Igreja, Coordenadas };
