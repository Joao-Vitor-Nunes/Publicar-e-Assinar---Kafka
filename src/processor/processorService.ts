import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { createLogger } from "../common/utils/logger";
import { ConfigProcessor } from "./processorConfig";
import { adicionarMedia, obterMedias } from "./processorStore";
import { criarClienteCloud } from "./cloudClient";
import { AmostraClimatica } from "../common/types/leituras";

const logger = createLogger("PROCESSOR");

export type Medias = {
  bairro: string;
  temperatura: number;
  umidade: number;
  insolacao: number;
};

function toNumeroSeguro(valor: unknown): number | null {
  if (typeof valor !== "string" && typeof valor !== "number") return null;
  const str = String(valor).replace(",", ".");
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

export function calcularMedias(dados: AmostraClimatica[]): Medias[] {
  const grupos: Record<string, { t: number[]; u: number[]; i: number[] }> = {};

  dados.forEach((d) => {
    const t = toNumeroSeguro(d.temperatura);
    const u = toNumeroSeguro(d.umidadeRelativa);
    const i = toNumeroSeguro(d.indiceInsolacao);

    if (!d.bairro || t === null || u === null || i === null) {
      logger.error("Leitura inválida ignorada no cálculo de médias", { d });
      return;
    }

    if (!grupos[d.bairro]) {
      grupos[d.bairro] = { t: [], u: [], i: [] };
    }
    grupos[d.bairro].t.push(t);
    grupos[d.bairro].u.push(u);
    grupos[d.bairro].i.push(i);
  });

  const resultado: Medias[] = [];
  for (const bairro in grupos) {
    const g = grupos[bairro];
    resultado.push({
      bairro,
      temperatura: g.t.reduce((a, b) => a + b, 0) / g.t.length,
      umidade: g.u.reduce((a, b) => a + b, 0) / g.u.length,
      insolacao: g.i.reduce((a, b) => a + b, 0) / g.i.length,
    });
  }

  return resultado;
}

export function iniciarServidorProcessor(config: ConfigProcessor): void {
  const packageDef = protoLoader.loadSync(config.caminhoProto);
  const proto = grpc.loadPackageDefinition(packageDef) as any;
  const calculoProto = proto.sensor_processor;

  const server = new grpc.Server();

  server.addService(calculoProto.CalculoService.service, {
    CalculaMedias: (
      call: grpc.ServerUnaryCall<{ dados: AmostraClimatica[] }, { medias: Medias[] }>,
      callback: grpc.sendUnaryData<{ medias: Medias[] }>,
    ) => {
      const entrada = call.request.dados ?? [];
      const medias = calcularMedias(entrada);

      logger.info("CalculaMedias chamado", {
        totalEntradas: entrada.length,
        totalBairros: medias.length,
      });

      callback(null, { medias });
    },

    ListarMedias: (
      call: grpc.ServerUnaryCall<unknown, { medias: Medias[] }>,
      callback: grpc.sendUnaryData<{ medias: Medias[] }>,
    ) => {
      const medias = obterMedias();

      logger.info("ListarMedias chamado pela Cloud", {
        totalMedias: medias.length,
      });

      callback(null, { medias });
    },
  });

  server.bindAsync(
    config.enderecoGrpc,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        logger.error("Falha ao iniciar servidor gRPC do processador", {
          erro: err.message,
        });
        return;
      }

      logger.info("Servidor gRPC do processador iniciado", {
        endpoint: config.enderecoGrpc,
        port,
      });

      server.start();
    },
  );
}

export function iniciarAgendadorLeiturasCloud(
  endpointCloud: string,
  intervaloMs: number,
): void {
  const clientCloud = criarClienteCloud(endpointCloud);

  setInterval(() => {
    clientCloud.ListarLeituras({}, (err, res) => {
      if (err) {
        logger.error("Falha ao buscar leituras na Cloud via gRPC", {
          codigo: err.code,
          detalhe: err.details,
        });
        return;
      }

      const dados = (res.dados ?? []) as AmostraClimatica[];
      if (!dados.length) {
        logger.info("Nenhuma leitura disponível na Cloud para calcular.");
        return;
      }

      const medias = calcularMedias(dados);

      logger.info("Processor calculou médias a partir da lista da Cloud", {
        totalLeituras: dados.length,
        totalBairros: medias.length,
        medias,
      });

      adicionarMedia(medias);
    });
  }, intervaloMs);
}
