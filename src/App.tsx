import React, { useState } from 'react';
import { Search } from 'lucide-react';
import proj4 from './utils/proj4Config';
import { queryService } from './utils/queryService';
import Header from './components/Header';
import Footer from './components/Footer';
import ResultsTable from './components/ResultsTable';
import DetailedResults from './components/DetailedResults';

function App() {
  // Estado para armazenar as coordenadas inseridas pelo usuário
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });

  // Estado para armazenar os resultados das consultas
  const [queryResults, setQueryResults] = useState<{ attributes: any; hasIntersection: boolean; layerName: string; }[]>([]);

  // Estado para armazenar mensagens de erro
  const [error, setError] = useState<string | null>(null);

  // Estado para indicar se a consulta está em andamento
  const [loading, setLoading] = useState(false);

  const [loadingCount, setLoadingCount] = useState(0); // Número de serviços em consulta

  // Estado para armazenar a camada selecionada para exibição de detalhes
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Estado para armazenar o nome do serviço atual em consulta
  const [currentService, setCurrentService] = useState<string | null>(null);

  // Estado para controlar a abertura do menu no cabeçalho
  const [menuOpen, setMenuOpen] = useState(false);

  // Lista de serviços de mapas a serem consultados
  const services = [
    {
      name: 'DF Legal - Relatório de Monitoramento',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/2'
    },
    {
      name: 'DF Legal - Área de Monitoramento Prioritário',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/2'
    },
    {
      name: 'DF Legal - Área em Processo de Urbanização',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/2'
    },
    {
      name: 'PDOT - Area de Proteção de Manancial',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/2'
    },
    {
      name: 'PDOT - Area de Interesse Ambiental',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/3'
    },
    {
      name: 'PDOT - Area Rural com Proteção Ambiental',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/27'
    },
    {
      name: 'PDOT - Macrozona - PDOT 2012',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/PDOT/MapServer/4'
    },
    {
      name: 'Geportal - Diretrizes Urbanísticas Específicas',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/DIRETRIZES_URBANISTICAS/MapServer/4'
    },
    {
      name: 'Geoportal - Faixa de Domínio - Rodovias',
      url: 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/SISTEMA_VIARIO/MapServer/14'
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

  // Função para realizar a consulta aos serviços de mapas
  const handleQuery = async () => {
    setLoading(true); // Indica que a consulta está em andamento
    setError(null); // Limpa mensagens de erro anteriores
    setQueryResults([]); // Limpa os resultados anteriores
    setSelectedLayer(null); // Reseta a camada selecionada
    setLoadingCount(services.length); // Define o número total de serviços a serem consultados
    setCurrentService(null); // Reseta o nome do serviço atual
  
    try {
      const lat = parseFloat(coordinates.lat);
      const lon = parseFloat(coordinates.lon);
  
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Coordenadas inválidas');
      }
  
      if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
        setError('Por favor, insira coordenadas válidas no formato "-15.886986, -47.984292".');
        return;
      }
  
      const [x, y] = proj4('EPSG:4326', 'EPSG:31983', [lon, lat]);
  
      const results = [];
      for (const service of services) {
        try {
          setCurrentService(service.name); // Atualiza o nome da camada em consulta
          const result = await queryService(
            service.url,
            service.name,
            x,
            y,
            service.protected,
            service.credentials
          );
          results.push(result); // Adiciona o resultado ao array
        } finally {
          setLoadingCount((prev) => prev - 1); // Decrementa o contador após cada consulta
        }
      }
  
      setQueryResults(results); // Armazena todos os resultados
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar consulta');
      setQueryResults([]);
    } finally {
      setLoading(false); // Indica que a consulta foi concluída
      setCurrentService(null); // Limpa o nome do serviço atual
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Cabeçalho da aplicação */}
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Conteúdo principal */}
      <div className="p-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          

          {/* Formulário para inserção de coordenadas */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Insira as Coordenadas</h1>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas (WGS84)</label>
              <input
                type="text"
                value={`${coordinates.lat}${coordinates.lon ? `, ${coordinates.lon}` : ''}`}
                onChange={(e) => {
                  const [lat, lon] = e.target.value.split(',').map((val) => val.trim());
                  setCoordinates({ lat: lat || '', lon: lon || '' });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuery(); // Realiza a consulta ao pressionar Enter
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exemplo: -15.886986, -47.984292"
              />
            </div>
            <button
              onClick={handleQuery} // Realiza a consulta ao clicar no botão
              disabled={loading} // Desabilita o botão enquanto a consulta está em andamento
              className="w-full bg-customBlue text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Consultando...' : <><Search size={20} /> Consultar</>}
            </button>

            {/* Spinner abaixo do botão */}
            {loadingCount > 0 && (
              <div className="flex flex-col items-center justify-center mt-4">
                <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
                <span className="ml-2 text-gray-700">
                  Consultando serviços... ({services.length - loadingCount}/{services.length})
                </span>
                {currentService && (
                  <span className="text-sm text-gray-500 mt-2">
                    Consultando: <strong>{currentService}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Exibe mensagens de erro, se houver */}
          {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"><p className="text-red-700">{error}</p></div>}

          {/* Exibe os resultados ou os detalhes da camada selecionada */}
          {selectedLayer ? (
            <DetailedResults
              selectedLayer={selectedLayer}
              setSelectedLayer={setSelectedLayer}
              queryResults={queryResults}
              coordinates={coordinates}
            />
          ) : (
            <ResultsTable queryResults={queryResults} setSelectedLayer={setSelectedLayer} />
          )}
        </div>
      </div>

      {/* Rodapé da aplicação */}
      <Footer />
    </div>
  );
}

export default App;