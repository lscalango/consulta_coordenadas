import React from 'react';
import jsPDF from 'jspdf'; // Importa a biblioteca jsPDF
import autoTable from 'jspdf-autotable'; // Importa o plugin jsPDF-AutoTable
import { FaFilePdf, FaWhatsapp } from 'react-icons/fa'; // Importa os ícones de PDF e WhatsApp

// Interface para definir as propriedades esperadas pelo componente ResultsTable
interface ResultsTableProps {
  queryResults: Array<{
    layerName: string; // Nome da camada
    hasIntersection: boolean; // Indica se há interseção com a camada
  }>;
  setSelectedLayer: (layerName: string | null) => void; // Função para definir a camada selecionada
}

// Componente ResultsTable
const ResultsTable: React.FC<ResultsTableProps> = ({ queryResults, setSelectedLayer }) => {
  // Se não houver resultados, não renderiza nada
  if (queryResults.length === 0) return null;

  // Obtém a data e hora atuais formatadas
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const currentDateTime = getCurrentDateTime(); // Data e hora atuais

  // Função para gerar o PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // Adiciona o título
    doc.setFontSize(16);
    doc.text('Análise da Localização', 10, 10);

    // Configura os dados da tabela
    const tableData = queryResults.map((result) => [
      result.layerName,
      result.hasIntersection ? 'Sim' : 'Não',
    ]);

    // Adiciona a data e hora ao final da tabela
    tableData.push(['Data e Hora da Análise', currentDateTime]);

    // Gera a tabela no PDF
    autoTable(doc, {
      startY: 20, // Posição inicial da tabela no eixo Y
      head: [['Camada', 'Incidência']], // Cabeçalho da tabela
      body: tableData, // Dados da tabela
      didParseCell: (data) => {
        // Aplica negrito para campos com "Sim"
        if (data.section === 'body' && data.column.index === 1 && data.cell.raw === 'Sim') {
          data.cell.styles.fontStyle = 'bold'; // Define o estilo da fonte como negrito
        }
      },
    });

    // Salva o PDF
    doc.save(`analise-localizacao-${currentDateTime.replace(/[:/]/g, '-')}.pdf`);
  };

  // Função para exportar os resultados para o WhatsApp
  const exportToWhatsApp = () => {
    // Gera a mensagem com os resultados
    const message = queryResults
      .map((result, index) =>
        `${index + 1}. ${result.layerName} - Incidência: ${
          result.hasIntersection ? '*Sim*' : 'Não'
        }`
      )
      .join('\n\n'); // Adiciona uma quebra de linha dupla entre os registros

    const fullMessage = `*Análise da Localização*\n\n${message}\n\n_Data e Hora da Análise: ${currentDateTime}_`;

    // Codifica a mensagem para a URL do WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

    // Abre o WhatsApp Web com a mensagem
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Título da tabela com os ícones */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Análise da Localização</h2>
        <div className="flex gap-4">
          <button
            onClick={generatePDF}
            className="text-red-500 hover:text-red-600 focus:outline-none flex items-center gap-2"
          >
            <FaFilePdf size={20} />
            <span></span>
          </button>
          <button
            onClick={exportToWhatsApp}
            className="text-green-500 hover:text-green-600 focus:outline-none flex items-center gap-2"
          >
            <FaWhatsapp size={20} />
            <span></span>
          </button>
        </div>
      </div>

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
          {/* Linha adicional com a data e hora */}
          <tr>
            <td className="py-3 px-4 border-b font-semibold text-sm">Data e Hora da Análise</td>
            <td className="py-3 px-4 border-b text-sm">{currentDateTime}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;