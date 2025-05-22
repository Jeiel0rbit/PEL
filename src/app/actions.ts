// @ts-nocheck
// remove-next-line-disabled-reason: Pending an update that allows for type-safe server actions.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
'use server';

export type ResolveState = {
  id?: string; 
  originalUrl?: string;
  finalUrl?: string;
  error?: string;
  timestamp?: string; 
  message?: string; 
  status?: number; 
};

export async function resolveUrlAction(
  prevState: ResolveState,
  formData: FormData,
): Promise<ResolveState> {
  const rawUrl = formData.get('url');

  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return { error: 'A URL não pode estar vazia.', message: 'Por favor, insira uma URL.' };
  }

  let urlInstance;
  try {
    urlInstance = new URL(rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `http://${rawUrl}`);
  } catch (e) {
    console.error('Erro de parsing da URL:', e);
    return { originalUrl: rawUrl, error: 'Formato de URL inválido.', message: 'A URL fornecida não parece ser válida. Verifique se ela começa com http:// ou https:// e tente novamente.' };
  }

  const validatedUrl = urlInstance.toString();

  try {
    const response = await fetch(validatedUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'DetetiveURL/1.0 (Resolvedor de URL)', 
      },
      signal: AbortSignal.timeout(10000), 
    });

    const finalUrl = response.url;
    const status = response.status;
    const timestamp = new Date().toISOString();

    let message = `A URL original parece válida. Status do destino final: ${status}.`;
    let error;

    if (status >= 400) {
      error = `Erro HTTP: ${status} ${response.statusText || 'Erro'}`;
      message = `A URL original levou a uma página de erro (Status: ${status}). Isso pode significar que a página não existe ou há um problema no servidor de destino.`;
      console.error(`Erro ao resolver ${validatedUrl}: Destino final ${finalUrl} retornou status ${status}`);
    } else if (finalUrl !== validatedUrl) {
      message = 'A URL original é válida e foi redirecionada para um novo endereço.';
    } else {
      message = 'A URL original é válida e não houve redirecionamentos.';
    }
    
    return {
      id: Math.random().toString(36).substring(7), 
      originalUrl: validatedUrl,
      finalUrl: finalUrl,
      error: error,
      timestamp: timestamp,
      message: message,
      status: status,
    };

  } catch (e: any) {
    console.error(`Falha técnica ao tentar resolver a URL ${validatedUrl}:`, e);
    let errorMessage = 'Não foi possível verificar a URL original.';
    if (e.name === 'AbortError') {
        errorMessage = 'A tentativa de verificar a URL demorou demais (mais de 10 segundos) e foi interrompida.';
    } else if (e.cause && typeof e.cause === 'object') {
        // @ts-ignore
        const causeCode = e.cause.code;
        if (causeCode === 'ENOTFOUND') errorMessage = 'O endereço (domínio) da URL original não foi encontrado. Verifique se digitou corretamente.';
        else if (causeCode === 'ECONNREFUSED') errorMessage = 'A conexão com o servidor da URL original foi recusada.';
        else if (causeCode === 'EAI_AGAIN') errorMessage = 'Houve uma falha temporária ao tentar encontrar o endereço da URL original. Tente novamente mais tarde.';
        else errorMessage = `Ocorreu um erro de rede (${causeCode || 'Desconhecido'}) ao tentar acessar a URL original.`;
    } else if (e instanceof TypeError && e.message.includes('fetch')) {
        errorMessage = 'A URL original parece inválida ou houve um problema de rede. Verifique a URL.';
    }
    
    return {
      originalUrl: validatedUrl, 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      message: 'Não foi possível obter informações sobre a URL original devido a um erro.'
    };
  }
}
