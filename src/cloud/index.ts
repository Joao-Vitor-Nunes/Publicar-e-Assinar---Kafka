import { carregarConfigCloud } from "./cloudConfig";
import { iniciarCloud } from "./cloudService";
import { iniciarServidorCloudGrpc } from "./cloudGrpcServer";
import { consumerCloud } from "../kafka";

async function main() {
  const config = carregarConfigCloud();
  await iniciarCloud(consumerCloud, config);
  iniciarServidorCloudGrpc();                
}

main().catch((err) => {
  console.error("[CLOUD] Erro fatal:", err);
  process.exit(1);
});
