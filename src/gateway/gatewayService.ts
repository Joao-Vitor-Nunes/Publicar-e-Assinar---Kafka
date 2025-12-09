// src/gateway/gatewayService.ts
import * as net from "net";
import { createLogger } from "../common/utils/logger";
import { ConfigGateway, PontoSensor } from "./gatewayConfig";

const logger = createLogger("GATEWAY");

export interface PublicadorEventosGateway {
  connect: () => Promise<void>;
  send: (params: { topic: string; messages: { value: string }[] }) => Promise<unknown>;
}

async function consultarSensorIndividual(
  sensor: PontoSensor,
  config: ConfigGateway,
  produtorKafka: PublicadorEventosGateway,
): Promise<void> {
  const clienteTcp = new net.Socket();

  clienteTcp.connect(sensor.porta, sensor.host, () => {
    logger.info("Solicitando leitura do sensor", {
      host: sensor.host,
      porta: sensor.porta,
    });
  });

  clienteTcp.on("data", async (buffer) => {
    try {
      const leituraBruta = JSON.parse(buffer.toString());
      const cargaKafka = {
        origemPorta: sensor.porta,
        leitura: leituraBruta,
      };

      logger.debug("Leitura recebida do sensor", {
        porta: sensor.porta,
        dados: cargaKafka,
      });

      await produtorKafka.send({
        topic: config.topicoKafka,
        messages: [{ value: JSON.stringify(cargaKafka) }],
      });
    } catch (erro) {
      logger.error("Falha ao processar dados do sensor", {
        porta: sensor.porta,
        erro: (erro as Error).message,
      });
    } finally {
      clienteTcp.end();
    }
  });

  clienteTcp.on("error", (erro) => {
    logger.error("Erro ao conectar ao sensor", {
      host: sensor.host,
      porta: sensor.porta,
      erro: erro.message,
    });
  });
}

export async function iniciarLoopGateway(
  produtorKafka: PublicadorEventosGateway,
  config: ConfigGateway,
): Promise<void> {
  logger.info("Gateway conectado ao Kafka, iniciando consultas periódicas", {
    intervaloMs: config.intervaloConsultaMs,
  });

  const executarConsulta = () => {
    logger.info("Gateway iniciando varredura de sensores...");
    for (const sensor of config.sensoresAlvos) {
      consultarSensorIndividual(sensor, config, produtorKafka).catch((erro) => {
        logger.error("Erro ao consultar sensor individual", {
          host: sensor.host,
          porta: sensor.porta,
          erro: erro.message,
        });
      });
    }
  };

  executarConsulta();
  setInterval(executarConsulta, config.intervaloConsultaMs);
}
