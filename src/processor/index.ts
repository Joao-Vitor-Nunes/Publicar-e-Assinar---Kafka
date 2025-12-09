import { carregarConfigProcessor } from "./processorConfig";
import { iniciarServidorProcessor } from "./processorService";
import { iniciarAgendadorLeiturasCloud } from "./processorService";

function main() {
  const config = carregarConfigProcessor();

  iniciarServidorProcessor(config);

  iniciarAgendadorLeiturasCloud("127.0.0.1:7100", 10000);
}

main();

