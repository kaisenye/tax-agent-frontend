declare global {
  namespace NodeJS {
    interface ProcessEnv {
      XAI_API_KEY: string;
    }
  }
}

export {}
