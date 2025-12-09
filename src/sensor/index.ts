import { carregarConfigSensor } from "./sensorConfig";
import { iniciarServidorSensor } from "./sensorService";

function main() {
  const configuracao = carregarConfigSensor();
  iniciarServidorSensor(configuracao);
}

main();
