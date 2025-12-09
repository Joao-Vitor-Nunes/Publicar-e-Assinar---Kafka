// src/cloud/cloudConfig.ts
export type ConfigCloud = {
  topicoKafka: string;
};

export function carregarConfigCloud(): ConfigCloud {
  return {
    topicoKafka: "dados_sensores",
  };
}
