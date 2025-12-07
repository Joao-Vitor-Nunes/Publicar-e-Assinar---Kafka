// gateway.ts
import * as net from "net";
import { producerGateway } from "./index";

const sensores = [
  { ip: "127.0.0.1", porta: 5000 },
  { ip: "127.0.0.1", porta: 5001 },
  { ip: "127.0.0.1", porta: 5002 },
  { ip: "127.0.0.1", porta: 5003 },
  { ip: "127.0.0.1", porta: 5004 },
];

async function consultarSensores() {
  console.log("Gateway consultando sensores...");

  for (const { ip, porta } of sensores) {
    const clientSensor = new net.Socket();

    clientSensor.connect(porta, ip, () => {
      console.log(`Solicitando dados do Sensor na porta ${porta}`);
    });

    clientSensor.on("data", async (data) => {
      try {
        const sensorData = JSON.parse(data.toString());
        const payload = { porta, dados: sensorData };

        console.log(`Gateway recebeu do Sensor ${porta}:`, payload);

        await producerGateway.send({
          topic: "dados_sensores",
          messages: [{ value: JSON.stringify(payload) }],
        });
      } catch (err) {
        console.error(`Erro ao processar dados do Sensor ${porta}:`, err);
      }

      clientSensor.end();
    });

    clientSensor.on("error", (err) => {
      console.error(`Erro ao conectar no Sensor ${porta}:`, err.message);
    });
  }
}

async function main() {
  await producerGateway.connect(); // conecta 1x
  // await producerGateway2.connect();
  console.log("Gateway conectado ao Kafka, iniciando loop");
  setInterval(consultarSensores, 5000); // a cada 5s
}

main().catch(console.error);
