// ./lib/image-loader.ts

import type { ImageLoader } from 'next/image';

const loader: ImageLoader = async ({ src, width, quality }) => {
  try {
    // A API fetch segue redirecionamentos por padrão.
    // Isso garante que a gente chegue na URL final da imagem.
    const response = await fetch(src);

    if (!response.ok) {
      // Retorna a URL original se houver um erro de requisição
      return src;
    }

    // Pega a URL final depois do redirecionamento
    const finalUrl = response.url;

    // Constrói a URL final com os parâmetros de otimização
    // do Next.js.
    return `${finalUrl}?w=${width}&q=${quality || 75}`;
  } catch (error) {
    // Em caso de erro, apenas loga e retorna a URL original como fallback
    console.error('Erro no loader de imagem customizado:', error);
    return src;
  }
};

export default loader;
