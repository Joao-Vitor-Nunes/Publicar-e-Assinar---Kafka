import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import { createLogger } from "../common/utils/logger";
import { obterLeiturasCloud } from "./cloudStore";
import { AmostraClimatica } from "../common/types/leituras";

const logger = createLogger("CLOUD-GRPC");

export function iniciarServidorCloudGrpc(): void {
  const protoPath = path.join(__dirname, "..", "proto", "cloud.proto");

  const packageDef = protoLoader.loadSync(protoPath);
  const proto = grpc.loadPackageDefinition(packageDef) as any;
  const cloudProto = proto.cloud_service;

  const server = new grpc.Server();

  server.addService(cloudProto.CloudService.service, {
    ListarLeituras: (
      call: grpc.ServerUnaryCall<{}, { dados: AmostraClimatica[] }>,
      callback: grpc.sendUnaryData<{ dados: AmostraClimatica[] }>,
    ) => {
      const dados = obterLeiturasCloud();

      logger.info("Listar Leituras chamado pelo processor", {
        totalLeituras: dados.length,
      });

      callback(null, { dados });
    },
  });

  const address = "0.0.0.0:7100";
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        logger.error("Falha ao iniciar servidor gRPC da Cloud", {
          erro: err.message,
        });
        return;
      }

      logger.info("Servidor gRPC da Cloud iniciado", {
        endpoint: address,
        port,
      });

      server.start();
    },
  );
}
