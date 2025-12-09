export type Logger = {
  info: (message: string, ...meta: unknown[]) => void;
  error: (message: string, ...meta: unknown[]) => void;
  debug: (message: string, ...meta: unknown[]) => void;
};

export function createLogger(contexto: string): Logger {
  const prefixo = `[${contexto}]`;

  return {
    info: (message, ...meta) => {
      console.info(prefixo, message, ...meta);
    },
    error: (message, ...meta) => {
      console.error(prefixo, message, ...meta);
    },
    debug: (message, ...meta) => {
      console.debug(prefixo, message, ...meta);
    },
  };
}
