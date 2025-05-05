import React from 'react';

// Interface para definir as propriedades esperadas pelo componente ResultsTable
interface ResultsTableProps {
  queryResults: Array<{
    layerName: string; // Nome da camada
    hasIntersection: boolean; // Indica se há interseção com a camada
  }>;
  setSelectedLayer: (layerName: string | null) => void; // Função para definir a camada selecionada
}

// Componente ResultsTable
// Este componente é responsável por exibir os resultados da consulta em uma tabela.
// Ele lista as camadas consultadas e indica se há interseção com cada uma delas.
const ResultsTable: React.FC<ResultsTableProps> = ({ queryResults, setSelectedLayer }) => {
  // Se não houver resultados, não renderiza nada
  if (queryResults.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Título da tabela */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Análise da Localização</h2>

      {/* Tabela para exibir os resultados */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {/* Cabeçalho da tabela */}
            <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Camada</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Incidência</th>
          </tr>
        </thead>
        <tbody>
          {/* Itera sobre os resultados da consulta e exibe cada camada */}
          {queryResults.map((result, index) => (
            <tr key={index}>
              {/* Nome da camada */}
              <td className="py-3 px-4 border-b">{result.layerName}</td>

              {/* Indicação de interseção */}
              <td className="py-3 px-4 border-b">
                {result.hasIntersection ? (
                  // Botão para visualizar detalhes da camada
                  <button
                    onClick={() => setSelectedLayer(result.layerName)} // Define a camada selecionada
                    className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
                  >
                    Sim (clique para ver detalhes)
                  </button>
                ) : (
                  // Indica que não há interseção
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

export default ResultsTable;