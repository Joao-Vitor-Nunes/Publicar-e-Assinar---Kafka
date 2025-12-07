// cloud.ts
import * as fs from "fs";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { consumerCloud } from "./index";

const processadorAddress = "127.0.0.1:7000"; // calculadora

const packageDef = protoLoader.loadSync("./calculo.proto");
const calculoProto = grpc.loadPackageDefinition(packageDef).calculo as any;

const clientGRPC = new calculoProto.CalculoService(
  processadorAddress,
  grpc.credentials.createInsecure()
);

async function main() {
  await consumerCloud.connect();
  await consumerCloud.subscribe({
    topic: "dados_sensores",
    fromBeginning: false,
  });

  await consumerCloud.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const payload = JSON.parse(message.value.toString());
      const dadosSensor = payload.dados;

      console.log("Cloud recebeu do Kafka:", payload);

      clientGRPC.CalculaMedias(
        { dados: [dadosSensor] },
        (err: any, response: any) => {
          if (err) {
            console.error("Erro ao chamar gRPC:", err);
          } else {
            console.log(
              "Cloud recebeu do Processador (via gRPC):",
              response.medias
            );
            fs.appendFileSync(
              "dados_cloud.txt",
              JSON.stringify(response.medias) + "\n"
            );
          }
        }
      );
    },
  });
}

main().catch(console.error);
