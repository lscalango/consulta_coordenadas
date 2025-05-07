import { getToken } from './getToken';

// Função para consultar um serviço de mapas
// Esta função realiza uma consulta a um serviço de mapas, verificando se há interseções
// em uma área de tolerância ao redor de um ponto fornecido.
export const queryService = async (
  url: string, // URL do serviço de mapas
  layerName: string, // Nome da camada ou serviço sendo consultado
  x: number, // Coordenada X (em EPSG:31983)
  y: number, // Coordenada Y (em EPSG:31983)
  protectedService: boolean, // Indica se o serviço é protegido e requer autenticação
  credentials: any // Credenciais para serviços protegidos
) => {
  try {
    const response = await fetch(`${url}/query?geometry=${x},${y}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=json`);
    const data = await response.json();

    if (data.error) {
      console.error(`Erro ao consultar o serviço ${layerName}:`, data.error);
      throw new Error(data.error.message);
    }

    return {
      layerName,
      attributes: data.features || null,
      hasIntersection: data.features && data.features.length > 0,
    };
  } catch (error) {
    console.error(`Erro ao consultar o serviço ${layerName}:`, error);
    throw error;
  }
};