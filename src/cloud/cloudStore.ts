import { AmostraClimatica } from "../common/types/leituras";

const bufferLeiturasCloud: AmostraClimatica[] = [];

export function adicionarLeituraCloud(leitura: AmostraClimatica): void {
  bufferLeiturasCloud.push(leitura);
}

export function obterLeiturasCloud(): AmostraClimatica[] {
  return bufferLeiturasCloud;
}
