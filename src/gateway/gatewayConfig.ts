export type PontoSensor = {
  host: string;
  porta: number;
};

export type ConfigGateway = {
  sensoresAlvos: PontoSensor[];
  intervaloConsultaMs: number;
  topicoKafka: string;
};

export function carregarConfigGateway(): ConfigGateway {
  const sensoresAlvos: PontoSensor[] = [
    { host: "0.0.0.0", porta: 5000 },
  ];

  return {
    sensoresAlvos,
    intervaloConsultaMs: 5000,
    topicoKafka: "dados_sensores",
  };
}
