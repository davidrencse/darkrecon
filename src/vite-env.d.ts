/// <reference types="vite/client" />

declare module 'virtual:flag-filenames' {
  export const FLAG_FILENAMES: readonly string[];
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg?url' {
  const url: string;
  export default url;
}

declare module '*.csv?raw' {
  const raw: string;
  export default raw;
}
