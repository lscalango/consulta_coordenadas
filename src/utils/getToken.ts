// Função para obter um token de autenticação para serviços protegidos
// Esta função realiza uma solicitação POST para o endpoint de geração de tokens
// e retorna o token gerado.

export const getToken = async (
  serviceUrl: string, // URL do serviço que requer autenticação
  credentials: { username: string; password: string } // Credenciais de autenticação (usuário e senha)
) => {
  // URL do endpoint para geração de tokens
  const tokenUrl = 'https://www.geoservicos.ide.df.gov.br/arcgis/tokens/generateToken';

  // Parâmetros necessários para a solicitação de token
  const params = new URLSearchParams({
    username: credentials.username, // Nome de usuário
    password: credentials.password, // Senha
    client: 'referer', // Tipo de cliente (referer neste caso)
    referer: window.location.origin, // Origem da solicitação (URL da aplicação)
    expiration: '60', // Tempo de expiração do token em minutos
    f: 'json' // Formato da resposta (JSON)
  });

  // Realiza a solicitação POST para o endpoint de geração de tokens
  const response = await fetch(tokenUrl, {
    method: 'POST', // Método HTTP
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Tipo de conteúdo da solicitação
    },
    body: params // Corpo da solicitação contendo os parâmetros
  });

  // Converte a resposta para JSON
  const data = await response.json();

  // Verifica se houve erro na solicitação
  if (data.error) {
    throw new Error('Erro ao obter token de autenticação'); // Lança um erro caso a solicitação falhe
  }

  // Retorna o token gerado
  return data.token;
};