import { iniciarAgendadorLeiturasCloud } from "./processorService";

function main() {
  const endpointCloud = "0.0.0.0:7100";
  iniciarAgendadorLeiturasCloud(endpointCloud, 10000);
}

main();
