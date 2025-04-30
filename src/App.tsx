import React, { useState } from 'react';
import { Search } from 'lucide-react';
import proj4 from 'proj4';

// Defina os sistemas de coordenadas EPSG:4326 e EPSG:31983
proj4.defs([
  [
    'EPSG:4326',
    '+proj=longlat +datum=WGS84 +no_defs'
  ],
  [
    'EPSG:31983',
    '+proj=utm +zone=23 +south +datum=WGS84 +units=m +no_defs'
  ]
]);

// Interface para representar os atributos de uma feição retornada pela consulta
interface FeatureAttributes {
  [key: string]: any;
}

// e para o resultado da consulta
interface QueryResult {
  attributes: FeatureAttributes | null;
  hasIntersection: boolean;
  layerName: string;
}

function App() {
  const [coordinates, setCoordinates] = useState({
    lat: '', // Latitude (EPSG:4326)
    lon: ''  // Longitude (EPSG:4326)
  });
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Lista de serviços a serem consultados
  const services = [
    {
      name: 'Geoportal - Area de Proteção de Manancial',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/2'
    },
    {
      name: 'Geoportal - Area de Interesse Ambiental',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/3'
    },
    {
      name: 'Geoportal - Area Rural com Proteção Ambiental',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/27'
    }, 
    {
      name: 'Geportal - Diretrizes Urbanísticas Específicas',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/DIRETRIZES_URBANISTICAS/MapServer/4'
    }, 
    {
      name: 'Geoportal - Lotes Registrados',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Aplicacoes/LOTES_REGISTRADOS/MapServer/0'
    },    
    {
      name: 'Geoportal¹ - Lotes Aprovados e Aguardando Registro',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Institucional/INSTITUCIONAIS/FeatureServer/1',
      protected: true,
      credentials: {
        username: 'institucional',
        password: '#inst@seduh'
      }
    },
    {
      name: 'Geoportal¹ - Próprios GDF',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Institucional/INSTITUCIONAIS/FeatureServer/6',
      protected: true,
      credentials: {
        username: 'institucional',
        password: '#inst@seduh'
      }
    },
    {
      name: 'Geoportal - Lotes Lei de Uso e Ocupação do Solo',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/LUOS/MapServer/11'
    },
    {
      name: 'Geoportal - Macrozona - PDOT 2012',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/4'
    },
    {
      name: 'Sisdia - App - Borda de Chapada',
      url: 'https://sisdia.df.gov.br/server/rest/services/06_ZEE/APPs_DF/MapServer/0'
    },
    {
      name: 'Sisdia - App - Cursos Dágua',
      url: 'https://sisdia.df.gov.br/server/rest/services/06_ZEE/APPs_DF/MapServer/1'
    },
    {
      name: 'Sisdia - App - Lagos e Lagoas Naturais',
      url: 'https://sisdia.df.gov.br/server/rest/services/06_ZEE/APPs_DF/MapServer/2'
    },
     {
      name: 'Sisdia - App - Nascentes',
      url: 'https://sisdia.df.gov.br/server/rest/services/06_ZEE/APPs_DF/MapServer/3'
    },
     {
      name: 'Sisdia - App - Reservatórios',
      url: 'https://sisdia.df.gov.br/server/rest/services/06_ZEE/APPs_DF/MapServer/4'
    }, 
    {
      name: 'Sisdia - Área de Relevante Interesse Ecológico',
      url: 'https://sisdia.df.gov.br/server/rest/services/01_AMBIENTAL/Area_de_Relevante_lnteresse_Ecologico/MapServer/0'
    },
    {
      name: 'Sisdia - Parques Ecológicos',
      url: 'https://sisdia.df.gov.br/server/rest/services/01_AMBIENTAL/Parques_Ecol%C3%B3gicos/MapServer/0'
    }, 
    {
      name: 'Sisdia - Parque Nacional',
      url: 'https://sisdia.df.gov.br/server/rest/services/01_AMBIENTAL/Parque_Nacional/MapServer/0'
    }
  ];

  // Função para consultar um serviço específico
  // Faz uma requisição para o serviço e retorna os atributos da feição encontrada
  // Se o serviço exigir autenticação, obtém um token de autenticação
  const queryService = async (serviceUrl: string, serviceName: string, x: number, y: number, protected_ = false, credentials?: { username: string; password: string }) => {
    const params = new URLSearchParams({
      geometry: `${x},${y}`,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      returnGeometry: 'false',
      f: 'json'
    });

    if (protected_ && credentials) {
      params.append('token', await getToken(serviceUrl, credentials));
    }

    const response = await fetch(`${serviceUrl}/query?${params}`);

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro ao consultar o serviço');
    }

    return {
      attributes: data.features?.[0]?.attributes || null,
      hasIntersection: data.features?.length > 0,
      layerName: serviceName
    };
  };

  const getToken = async (serviceUrl: string, credentials: { username: string; password: string }) => {
    const tokenUrl = 'https://www.geoservicos.ide.df.gov.br/arcgis/tokens/generateToken';
    const params = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
      client: 'referer',
      referer: window.location.origin,
      expiration: '60',
      f: 'json'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    const data = await response.json();
    if (data.error) {
      throw new Error('Erro ao obter token de autenticação');
    }

    return data.token;
  };

 // Função para lidar com a consulta ao clicar no botão
 const handleQuery = async () => {
  setLoading(true);
  setError(null);
  setQueryResults([]);
  setSelectedLayer(null);

  try {
    const lat = parseFloat(coordinates.lat);
    const lon = parseFloat(coordinates.lon);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Coordenadas inválidas');
    }

    // Transformar de EPSG:4326 (lat/lon) para EPSG:31983 (x/y)
    const [x, y] = proj4('EPSG:4326', 'EPSG:31983', [lon, lat]);

    const results = await Promise.all(
      services.map(service =>
        queryService(
          service.url,
          service.name,
          x,
          y,
          service.protected,
          service.credentials
        )
      )
    );

      setQueryResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar consulta');
      setQueryResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza os resultados iniciais da consulta
  // Exibe uma tabela com as camadas consultadas e se houve interseção
  // Se houver interseção, exibe um botão para ver os detalhes
  const renderInitialResults = () => {
    if (queryResults.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Análise da Localização</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Camada</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Incidência</th>
            </tr>
          </thead>
          <tbody>
            {queryResults.map((result, index) => (
              <tr key={index}>
                <td className="py-3 px-4 border-b">{result.layerName}</td>
                <td className="py-3 px-4 border-b">
                  {result.hasIntersection ? (
                    <button
                      onClick={() => setSelectedLayer(result.layerName)}
                      className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
                    >
                      Sim (clique para ver detalhes)
                    </button>
                  ) : (
                    'Não'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderiza os detalhes da feição selecionada
  // Exibe uma tabela com os atributos da feição
  const renderDetailedResults = () => {
    if (!selectedLayer) return null;

    const result = queryResults.find(r => r.layerName === selectedLayer);
    if (!result?.attributes) return null;

    const attributes = Object.entries(result.attributes)
      .filter(([key, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({
        label: key,
        value: value.toString()
      }));

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Detalhes da Feição</h2>
          <button
            onClick={() => setSelectedLayer(null)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Voltar
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Atributo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Valor</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((field) => (
              <tr key={field.label}>
                <td className="py-3 px-4 border-b font-medium text-gray-600">{field.label}</td>
                <td className="py-3 px-4 border-b text-gray-800">{field.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Consulta Localização - Pronto Emprego
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude (WGS84)
              </label>
              <input
                type="text"
                value={coordinates.lat}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: -15.7942"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude (WGS84)
              </label>
              <input
                type="text"
                value={coordinates.lon}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: -47.8822"
              />
            </div>
          </div>

          <button
            onClick={handleQuery}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Consultando...'
            ) : (
              <>
                <Search size={20} />
                Consultar
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {queryResults.length > 0 && !selectedLayer && renderInitialResults()}
        {selectedLayer && renderDetailedResults()}
      </div>
    </div>
  );
}

export default App;