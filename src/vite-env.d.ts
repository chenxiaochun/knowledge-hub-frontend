/// <reference types="vite/client" />

import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    silentError?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    silentError?: boolean;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
