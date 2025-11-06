// ./lib/image-loader.ts

import type { ImageLoader } from 'next/image';

const loader: ImageLoader = ({ src, width, quality }) => {
  // Constrói a URL final com os parâmetros de otimização do Next.js.
  // Não é possível fazer fetch ou async aqui, pois o loader precisa ser síncrono.
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default loader;
