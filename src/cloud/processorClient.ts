import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";

export type MediasGrpc = {
  bairro: string;
  temperatura: number;
  umidade: number;
  insolacao: number;
};

type ProcessorServiceClient = grpc.Client & {
  ListarMedias: (
    req: {},
    cb: (err: grpc.ServiceError | null, res: { medias: MediasGrpc[] }) => void,
  ) => void;
};

export function criarClienteProcessor(endpoint: string): ProcessorServiceClient {
  const protoPath = path.join(__dirname, "..", "proto", "sensor_processor.proto");
  const packageDef = protoLoader.loadSync(protoPath);
  const proto = grpc.loadPackageDefinition(packageDef) as any;
  const calculoProto = proto.sensor_processor;

  const client = new calculoProto.CalculoService(
    endpoint,
    grpc.credentials.createInsecure(),
  ) as ProcessorServiceClient;

  return client;
}
