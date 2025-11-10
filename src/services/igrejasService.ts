interface Igreja {
  id: string;
  nome: string;
  endereco: string;
  cidade?: string;
  estado?: string;
  distancia: number; // em km
  latitude: number;
  longitude: number;
  telefone?: string;
  website?: string;
  denominacao?: string;
  horarios?: {
    missas?: string[];
    confissao?: string[];
    abertura?: string;
  };
}

interface Coordenadas {
  lat: number;
  lng: number;
}

class IgrejasService {
  private userLocation: Coordenadas | null = null;

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
          maximumAge: 300000, // Cache de 5 minutos
        }
      );
    });
  }

  // Busca igrejas católicas próximas usando Overpass API
  async buscarIgrejasProximas(raioKm: number = 5): Promise<Igreja[]> {
    try {
      if (!this.userLocation) {
        this.userLocation = await this.getUserLocation();
      }

      const { lat, lng } = this.userLocation;
      const raioMetros = raioKm * 1000;

      // Query Overpass API para igrejas católicas
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"](around:${raioMetros},${lat},${lng});
          way["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"](around:${raioMetros},${lat},${lng});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch(
        'https://overpass-api.de/api/interpreter',
        {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar igrejas');
      }

      const data = await response.json();
      
      const igrejas: Igreja[] = data.elements
        .filter((element: any) => element.tags?.name) // Apenas com nome
        .map((element: any) => {
          const coords = {
            lat: element.lat || element.center?.lat || 0,
            lng: element.lon || element.center?.lon || 0,
          };

          return {
            id: element.id.toString(),
            nome: element.tags.name,
            endereco: this.formatarEndereco(element.tags),
            cidade: element.tags['addr:city'],
            estado: element.tags['addr:state'],
            distancia: this.calcularDistancia(this.userLocation!, coords),
            latitude: coords.lat,
            longitude: coords.lng,
            telefone: element.tags.phone || element.tags['contact:phone'],
            website: element.tags.website || element.tags['contact:website'],
            denominacao: 'Católica',
            horarios: this.extrairHorarios(element.tags),
          };
        })
        .filter((igreja: Igreja) => igreja.latitude !== 0); // Remove inválidas

      // Ordenar por distância
      igrejas.sort((a, b) => a.distancia - b.distancia);

      return igrejas;
    } catch (error) {
      console.error('Erro ao buscar igrejas:', error);
      throw error;
    }
  }

  // Formata endereço a partir das tags do OSM
  private formatarEndereco(tags: any): string {
    const partes: string[] = [];

    if (tags['addr:street']) {
      let rua = tags['addr:street'];
      if (tags['addr:housenumber']) {
        rua += `, ${tags['addr:housenumber']}`;
      }
      partes.push(rua);
    }

    if (tags['addr:suburb'] || tags['addr:neighbourhood']) {
      partes.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
    }

    if (tags['addr:city']) {
      let cidade = tags['addr:city'];
      if (tags['addr:state']) {
        cidade += ` - ${tags['addr:state']}`;
      }
      partes.push(cidade);
    }

    if (tags['addr:postcode']) {
      partes.push(`CEP ${tags['addr:postcode']}`);
    }

    return partes.length > 0 ? partes.join(', ') : 'Endereço não disponível';
  }

  // Extrai horários das tags
  private extrairHorarios(tags: any): Igreja['horarios'] {
    const horarios: Igreja['horarios'] = {};

    // Horários gerais de abertura
    if (tags.opening_hours) {
      horarios.abertura = tags.opening_hours;
    }

    // Horários de missa (se especificado)
    if (tags['service_times:mass'] || tags['mass_times']) {
      const missas = tags['service_times:mass'] || tags['mass_times'];
      horarios.missas = missas.split(';').map((h: string) => h.trim());
    }

    // Horários de confissão (se especificado)
    if (tags['service_times:confession'] || tags['confession_times']) {
      const confissao = tags['service_times:confession'] || tags['confession_times'];
      horarios.confissao = confissao.split(';').map((h: string) => h.trim());
    }

    return horarios;
  }

  // Calcula distância entre dois pontos (Haversine)
  private calcularDistancia(coord1: Coordenadas, coord2: Coordenadas): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return Math.round(distancia * 10) / 10; // Arredonda para 1 casa decimal
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Gera URL para Google Maps Directions
  obterDirecoesURL(igreja: Igreja): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${igreja.latitude},${igreja.longitude}`;
  }

  // Converte coordenadas em endereço legível (geocoding reverso)
  async obterEnderecoAtual(): Promise<string> {
    try {
      if (!this.userLocation) {
        this.userLocation = await this.getUserLocation();
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${this.userLocation.lat}&lon=${this.userLocation.lng}&format=json`
      );

      const data = await response.json();
      
      const cidade = data.address?.city || data.address?.town || data.address?.village;
      const estado = data.address?.state;

      if (cidade && estado) {
        return `${cidade}, ${estado}`;
      }

      return 'Localização atual';
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      return 'Localização atual';
    }
  }
}

export const igrejasService = new IgrejasService();
export type { Igreja, Coordenadas };
