import { createLogger } from "../common/utils/logger";
import { ConfigCloud } from "./cloudConfig";
import { adicionarLeituraCloud } from "./cloudStore";
import { AmostraClimatica } from "../common/types/leituras";

const logger = createLogger("CLOUD");

export interface ConsumidorKafkaCloud {
  connect: () => Promise<void>;
  subscribe: (config: { topic: string; fromBeginning: boolean }) => Promise<void>;
  run: (config: {
    eachMessage: (args: {
      topic: string;
      partition: number;
      message: { value: Buffer | null };
    }) => Promise<void>;
  }) => Promise<void>;
}

type PayloadKafka = {
  origemPorta?: number;
  leitura?: AmostraClimatica;
  dados?: AmostraClimatica;
};

export async function iniciarCloud(
  consumerCloud: ConsumidorKafkaCloud,
  config: ConfigCloud,
): Promise<void> {
  await consumerCloud.connect();
  await consumerCloud.subscribe({
    topic: config.topicoKafka,
    fromBeginning: false,
  });

  logger.info("Cloud conectada ao Kafka e aguardando mensagens.", {
    topico: config.topicoKafka,
  });

  await consumerCloud.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      let payload: PayloadKafka;
      try {
        payload = JSON.parse(message.value.toString());
      } catch (erro) {
        logger.error("Falha ao fazer parse do payload vindo do Kafka", {
          erro: (erro as Error).message,
        });
        return;
      }

      const dado: AmostraClimatica | undefined = payload.leitura ?? payload.dados;

      if (!dado) {
        logger.error(
          "Payload do Kafka não contém campo 'leitura' nem 'dados', ignorando.",
          { payload },
        );
        return;
      }

      logger.info("Cloud recebeu leitura do Kafka", {
        topic,
        partition,
        dado,
      });

      adicionarLeituraCloud(dado);
    },
  });
}
