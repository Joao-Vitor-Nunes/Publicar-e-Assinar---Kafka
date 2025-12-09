import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import { AmostraClimatica } from "../common/types/leituras";


type CloudServiceClient = grpc.Client & {
  ListarLeituras: (
    req: {},
    cb: (err: grpc.ServiceError | null, res: { dados: AmostraClimatica[] }) => void,
  ) => void;
};

export function criarClienteCloud(endpoint: string): CloudServiceClient {
  const protoPath = path.join(__dirname, "..", "proto", "cloud.proto");
  const packageDef = protoLoader.loadSync(protoPath);
  const proto = grpc.loadPackageDefinition(packageDef) as any;
  const cloudProto = proto.cloud_service;

  const client = new cloudProto.CloudService(
    endpoint,
    grpc.credentials.createInsecure(),
  ) as CloudServiceClient;

  return client;
}
