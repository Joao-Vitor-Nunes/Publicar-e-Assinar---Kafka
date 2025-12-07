import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./calculo.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH);
const calculoProto = grpc.loadPackageDefinition(packageDef).calculo as any;

const server = new grpc.Server();

interface Dado {
  bairro: string;
  temperatura: string;
  umidade: string;
  insolacao: string;
}

interface Medias {
  bairro: string;
  temperatura: number;
  umidade: number;
  insolacao: number;
}

function calcularMedias(dados: Dado[]): Medias[] {
  const grupos: Record<string, { t: number[]; u: number[]; i: number[] }> = {};

  dados.forEach((d) => {
    if (!grupos[d.bairro]) grupos[d.bairro] = { t: [], u: [], i: [] };
    grupos[d.bairro].t.push(Number(d.temperatura));
    grupos[d.bairro].u.push(Number(d.umidade));
    grupos[d.bairro].i.push(Number(d.insolacao));
  });

  const resultado: Medias[] = [];
  for (const bairro in grupos) {
    resultado.push({
      bairro,
      temperatura:
        grupos[bairro].t.reduce((a, b) => a + b, 0) / grupos[bairro].t.length,
      umidade:
        grupos[bairro].u.reduce((a, b) => a + b, 0) / grupos[bairro].u.length,
      insolacao:
        grupos[bairro].i.reduce((a, b) => a + b, 0) / grupos[bairro].i.length,
    });
  }
  return resultado;
}

server.addService(calculoProto.CalculoService.service, {
  CalculaMedias: (
    call: grpc.ServerUnaryCall<{ dados: Dado[] }, { medias: Medias[] }>,
    callback: grpc.sendUnaryData<{ medias: Medias[] }>
  ) => {
    const resultado = calcularMedias(call.request.dados);
    console.log("Processador calculou médias:", resultado);
    callback(null, { medias: resultado });
  },
});

const address = "127.0.0.1:7000"; 
server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
  console.log("Servidor gRPC do Processador rodando em", address);
  server.start();
});