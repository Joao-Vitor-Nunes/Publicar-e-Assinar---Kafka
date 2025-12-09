import * as net from "net";
import { AmostraClimatica } from "../common/types/leituras";
import { createLogger } from "../common/utils/logger";
import { ConfigSensor } from "./sensorConfig";

const logger = createLogger("NODE_SENSOR");

function gerarAmostraClimatica(regiaoMonitorada: string): AmostraClimatica {
  return {
    regiao: regiaoMonitorada,
    temperatura: (Math.random() * (35 - 18) + 18).toFixed(1),
    umidadeRelativa: (Math.random() * (90 - 30) + 30).toFixed(1),
    indiceInsolacao: (Math.random() * (1000 - 100) + 100).toFixed(1),
  };
}

export function iniciarServidorSensor(config: ConfigSensor): void {
  const servidorSensor = net.createServer((conexaoGateway) => {
    logger.info(
      `Gateway conectado`,
      {
        host: config.hostEscuta,
        porta: config.portaEscuta,
        regiao: config.regiaoMonitorada,
      },
    );

    const temporizadorEnvio = setInterval(() => {
      const leitura = gerarAmostraClimatica(config.regiaoMonitorada);
      const payload = JSON.stringify(leitura) + "\n";

      conexaoGateway.write(payload);
      logger.debug("Pacote enviado para gateway", { leitura });
    }, config.intervaloEnvioMs);

    conexaoGateway.on("close", () => {
      clearInterval(temporizadorEnvio);
      logger.info("Conexão com gateway encerrada, envio interrompido");
    });

    conexaoGateway.on("error", (erro) => {
      clearInterval(temporizadorEnvio);
      logger.error("Erro na conexão com gateway", { erro: erro.message });
    });
  });

  servidorSensor.listen(config.portaEscuta, config.hostEscuta, () => {
    logger.info("Servidor de sensor iniciado", {
      host: config.hostEscuta,
      porta: config.portaEscuta,
      regiao: config.regiaoMonitorada,
      intervaloMs: config.intervaloEnvioMs,
    });
  });
}
