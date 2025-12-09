import * as path from "path";

export type ConfigProcessor = {
  enderecoGrpc: string;
  caminhoProto: string;
};

export function carregarConfigProcessor(): ConfigProcessor {
  const caminhoProto = path.join(
    __dirname,
    "..",
    "proto",
    "sensor_processor.proto",
  );

  return {
    enderecoGrpc: "0.0.0.0:7000",
    caminhoProto,
  };
}
