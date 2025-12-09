export type ConfigSensor = {
  hostEscuta: string;
  portaEscuta: number;
  bairroMonitorado: string;
  intervaloEnvioMs: number;
};

export function carregarConfigSensor(): ConfigSensor {
  const bairroMonitorado = process.argv[2];
  const portaArg = Number(process.argv[3]);

  if (!bairroMonitorado || Number.isNaN(portaArg)) {
    console.error(
      "[NODE_SENSOR] Uso correto: npm start <Bairro_Momitorado> <PORTA>",
    );
    process.exit(1);
  }

  return {
    hostEscuta: "0.0.0.0",
    portaEscuta: portaArg,
    bairroMonitorado,
    intervaloEnvioMs: 3000,
  };
}
