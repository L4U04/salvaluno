import type { ImageLoader } from 'next/image';

const loader: ImageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default loader;
