import { carregarConfigCloud } from "./cloudConfig";
import { iniciarCloud } from "./cloudService";
import { iniciarServidorCloudGrpc } from "./cloudGrpcServer";
import { criarClienteProcessor } from "./processorClient";
import { createLogger } from "../common/utils/logger";
import { consumerCloud } from "../kafka";

const logger = createLogger("CLOUD");

async function main() {
  const config = carregarConfigCloud();
  await iniciarCloud(consumerCloud, config);
  iniciarServidorCloudGrpc();

  const endpointProcessor = "127.0.0.1:7000";
  const clientProcessor = criarClienteProcessor(endpointProcessor);

  setInterval(() => {
  clientProcessor.ListarMedias({}, (err, res) => {
    if (err) {
      logger.error("Falha ao buscar médias do Processor via gRPC", {
        codigo: err.code,
        detalhe: err.details,
      });
      return;
    }

    const medias = res.medias ?? [];
    if (!medias.length) {
      logger.info("Nenhuma média disponível no Processor.");
      return;
    }

    logger.info("Cloud recebeu médias do Processor via gRPC", {
      totalMedias: medias.length,
      medias,
    });
  });
}, 15000);

}

main().catch((err) => {
  console.error("[CLOUD] Erro fatal:", err);
  process.exit(1);
});
