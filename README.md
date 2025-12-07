# 🌆 Desafio dos Sensores Urbanos (Agora com invocação remota entre Cloud <-> Processador)

Projeto desenvolvido para a disciplina de **Sistemas Distribuídos**.  
O desafio simula o uso de sensores de **temperatura, umidade e insolação** espalhados em cinco bairros de uma cidade.  
Os sensores expõem dados via **socket** **TCP** para um **gateway**, que consulta periodicamente esses sensores, publica os dados em um tópico **Kafka**, a **cloud** consome essas mensagens, chama remotamente o **processador** via **gRPC** para calcular as médias e persiste os resultados em um arquivo dados_cloud.txt

---

## 📌 Objetivo
- Compreender a comunicação entre processos usando **Sockets TCP, Kafka (pub/sub) e gRPC** em **Node.js**.  
- Criar uma arquitetura distribuída capaz de:
  1. Gerar dados simulados a partir de sensores (dados aleatórios).
  2. Coletar dados dos sensores no gateway via sockets.
  3. Publicar os dados do gateway em um tópico Kafka.
  4. Consumir os dados do Kafka na cloud.
  5. Repassar dados da cloud para o processador via gRPC.
  6. Processar os dados no processador (cálculo de médias).
  7. Receber as médias na cloud e armazenar em um “Banco de Dados” (arquivo .txt).

---

## 🏗️ Arquitetura da Solução

Sensores → Gateway ↔ Cloud ↔ Processador

```yaml
- **Sensores:** (SERVIDOR TCP) geram valores aleatórios de temperatura, umidade e insolação e respondem ao gateway quando ele conecta em cada porta.  
- **Gateway:** (CLIENTE TCP + PRODUTOR KAFKA) conecta nos sensores, agrega os dados e publica periodicamente em um tópico Kafka (dados_sensores).    
- **Cloud:** (CONSUMIDOR KAFKA + CLIENTE gRPC) consome mensagens do tópico, extrai os dados dos sensores, chama o serviço remoto do Processador via gRPC, e grava as médias retornadas em dados_cloud.txt.
- **Processador:** (SERVIDOR gRPC) recebe da Cloud um array de leituras já serializado, calcula as médias por bairro e devolve o resultado na resposta gRPC.
```

---

## ⚙️ Tecnologias Utilizadas
- **Node.js** (TypeScript)  
- **Módulo `net`** para comunicação por sockets TCP  
- **gRPC** com **@grpc/grpc-js** e **@grpc/proto-loader** para invocação remota entre Cloud e Processador
- **Apache Kafka** como barramento de mensagens
- **KafkaJS** como cliente Kafka para Node.js
- **Docker / Docker Compose** para subir o broker Kafka em ambiente local.

Essa topologia ilustra comunicação indireta desacoplada com Kafka e invocação remota tipo RPC com gRPC.

---

## 📂 Estrutura do Projeto

```bash
/socket_invocacao_remota
├── sensor.ts          # Simula sensores de cada bairro (servidores TCP)
├── gateway.ts         # Consulta sensores e publica em tópico Kafka
├── cloud.ts           # Consome Kafka, chama gRPC e grava dados_cloud.txt
├── processador.ts     # Servidor gRPC que calcula médias
├── kafkaConfig.ts     # Configuração do KafkaJS (producer/consumer)
├── calculo.proto      # Definição do serviço gRPC (CalculoService)
├── docker-compose.yml # Subida do broker Kafka via Docker
├── dados_cloud.txt    # "Banco de Dados" com as médias calculadas
└── start.bat # Simula as 8 maquinas abrindo vários prompts de comando (Por favor não se assuste 👻😂)
└── README.md          # Documentação do projeto
```

O uso de KafkaJS e docker-compose segue exemplos típicos de ambiente de desenvolvimento com Kafka.

---

## ▶️ Como Executar

1. **Clone o repositório**  
   ```bash
   git clone https://github.com/kaue05/Cidade-Sistemas-Distribuidos-Comunicacao-Indireta
   cd sensores-urbanos
   ```

2. **Suba o Kafka com Docker**
```bash
docker compose up   # ou docker-compose up
```

3. **Abra 4 terminais diferentes e rode nessa ordem:**

Gateway

```bash
npx ts-node gateway.ts
```

Processador
```bash
npx ts-node processador.ts
```

Cloud
```bash
npx ts-node cloud.ts
```

Sensores (um por bairro)
```bash
npx ts-node sensor.ts Centro 5000
npx ts-node sensor.ts Norte 5001
npx ts-node sensor.ts Sul 5002
npx ts-node sensor.ts Leste 5003
npx ts-node sensor.ts Oeste 5004
```

🔍 Exemplo de Saída
Sensor
```bash
Sensor Centro rodando em 127.0.0.1:5000
Gateway conectado ao sensor do bairro Centro (porta 5000)`
```

Gateway
```bash
Gateway aguardando Cloud em 127.0.0.1:6000
Cloud conectado ao Gateway
Cloud requisitou dados -> consultando sensores...
Solicitando dados do Sensor na porta 5000
```

Processador
```bash
Processador aguardando Cloud em 127.0.0.1:7000
Cloud conectado ao Processador
Processador calculou::
{
  Centro: { temperatura: '23.0', umidade: '66.0', insolacao: '500.0' },
  Norte:  { temperatura: '20.5', umidade: '70.0', insolacao: '600.0' }
}
```

Cloud
```bash
Cloud recebeu do Gateway::
{
  Centro: { temperatura: '23.0', umidade: '66.0', insolacao: '500.0' },
}
Cloud recebeu do Processador:
{
  Centro: { temperatura: '23.0', umidade: '66.0', insolacao: '500.0' },
}
```

Nesse fluxo, o gateway conecta periodicamente em cada sensor, publica as leituras no tópico Kafka, a cloud consome essas mensagens, chama o processador via gRPC e persiste as médias em dados_cloud.txt