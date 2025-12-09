export type ConfigSensor = {
  hostEscuta: string;
  portaEscuta: number;
  regiaoMonitorada: string;
  intervaloEnvioMs: number;
};

export function carregarConfigSensor(): ConfigSensor {
  const regiaoMonitorada = process.argv[2];
  const portaArg = Number(process.argv[3]);

  if (!regiaoMonitorada || Number.isNaN(portaArg)) {
    console.error(
      "[NODE_SENSOR] Uso correto: npm start <REGIAO_MONITORADA> <PORTA>",
    );
    process.exit(1);
  }

  return {
    hostEscuta: "0.0.0.0",
    portaEscuta: portaArg,
    regiaoMonitorada,
    intervaloEnvioMs: 3000,
  };
}
