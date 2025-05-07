README - Consulta de Camadas para Análise de Interferência
Descrição do Projeto
Este projeto é uma aplicação web desenvolvida para realizar consultas de camadas geográficas e análise de interferências em diferentes serviços de mapas. A aplicação permite que o usuário insira coordenadas no formato WGS84 (latitude, longitude) e obtenha informações detalhadas sobre as camadas disponíveis em serviços como Geoportal, Sisdia e Terrageo.

A aplicação utiliza tecnologias modernas como React, integração com APIs REST de serviços ArcGIS e suporte a autenticação para serviços protegidos.

Funcionalidades
    Inserção de coordenadas no formato WGS84 (latitude, longitude).
    Consulta a múltiplos serviços de mapas, incluindo:
    Geoportal
    Sisdia
    Terrageo (com autenticação via token).
    Exibição de resultados em uma tabela interativa.
    Detalhamento de camadas específicas.
    Feedback visual durante o processo de consulta (spinners e mensagens de erro).

1. Sistemas Operacionais Suportados
    Windows 10 ou superior
    macOS 11 (Big Sur) ou superior
    Distribuições Linux modernas (Ubuntu 20.04+, Fedora 34+)

3. Infraestrutura Necessária
    Node.js: Versão 16 ou superior.
    Gerenciador de Pacotes: npm (incluído com o Node.js) ou yarn.
    Servidor Web: Não é necessário configurar um servidor externo, pois o projeto utiliza o servidor de desenvolvimento do React.
    Conexão com a Internet: Necessária para acessar os serviços de mapas e gerar tokens de autenticação.

5. Dependências do Projeto
    React: Framework para construção da interface do usuário.
    Lucide-react: Biblioteca de ícones para componentes visuais.
    Proj4: Biblioteca para transformação de coordenadas geográficas.
    Fetch API: Para realizar requisições HTTP aos serviços de mapas.

7. Configuração de Serviços
    Geoportal e Sisdia:
    Acesso público, sem necessidade de autenticação.
    Terrageo:
    Requer autenticação via token.
    Configuração do domínio autorizado no Portal for ArcGIS.
    Credenciais de acesso fornecidas pelo administrador do serviço.

Como Executar o Projeto
  Clone o Repositório
  Instale as Dependências
  Inicie o Servidor de Desenvolvimento
  Acesse a Aplicação
  Abra o navegador e acesse: http://localhost:3000.
  Configuração de Autenticação para o Terrageo
  Certifique-se de que o domínio do aplicativo está autorizado no Portal for ArcGIS.
  Atualize as credenciais no arquivo app.tsx

      {
        name: 'Terrageo - Fundiário - Imóveis Rurais',
        url: 'https://terrageo2.terracap.df.gov.br/arcgis/rest/services/ImoveisRurais/Fundiario1/MapServer/0',
        protected: true,
        credentials: {
          username: 'seu-usuario',
          password: 'sua-senha',
        },
      }

Estrutura do Projeto
src/components: Componentes reutilizáveis, como Header, Footer, ResultsTable e DetailedResults.
src/utils: Funções utilitárias, como queryService e configuração do proj4.
src/App.tsx: Componente principal da aplicação.

Contribuição
Contribuições são bem-vindas! 
