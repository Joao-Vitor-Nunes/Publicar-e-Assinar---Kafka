import { carregarConfigGateway } from "./gatewayConfig";
import { iniciarLoopGateway, PublicadorEventosGateway } from "./gatewayService";
import { producerGateway } from "../kafka"

async function main() {
  const configGateway = carregarConfigGateway();

  await (producerGateway as PublicadorEventosGateway).connect();

  await iniciarLoopGateway(
    producerGateway as PublicadorEventosGateway,
    configGateway,
  );
}

main().catch((erro) => {
  console.error("[GATEWAY] Erro fatal no processo principal:", erro);
  process.exit(1);
});
