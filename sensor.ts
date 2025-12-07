import * as net from "net";

const BAIRRO: string = process.argv[2]; // posicao do argumento
const HOST: string = "127.0.0.1"; // localhost
const PORTA: number = parseInt(process.argv[3]);

// Função que gera dados fake
function gerarDados() {
  return {
    bairro: BAIRRO,
    temperatura: (Math.random() * (35 - 18) + 18).toFixed(1),
    umidade: (Math.random() * (90 - 30) + 30).toFixed(1),
    insolacao: (Math.random() * (1000 - 100) + 100).toFixed(1),
  };
}

// Servidor de sensores
const server = net.createServer((socket) => {
  console.log(
    `Gateway conectado ao sensor do bairro ${BAIRRO} (porta ${PORTA})`
  );

  const intervalo = setInterval(() => {
    const dados = gerarDados();
    socket.write(JSON.stringify(dados));
  }, 3000);

  socket.on("close", () => {
    clearInterval(intervalo);
    console.log(`Conexão fechada com sensor do bairro ${BAIRRO}`);
  });
});

server.listen(PORTA, HOST, () => {
  console.log(`Sensor (${BAIRRO}) rodando em ${HOST}:${PORTA}`);
});
