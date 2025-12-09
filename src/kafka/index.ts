import {
  Kafka,
  logLevel,
  type KafkaConfig,
  type Producer,
  type Consumer,
} from "kafkajs";

const kafkaConfig: KafkaConfig = {
  logLevel: logLevel.NOTHING,
  brokers: ["localhost:9092"]
};

const kafka = new Kafka(kafkaConfig);

const producerGateway: Producer = kafka.producer();

const consumerCloud: Consumer = kafka.consumer({ groupId: "cloud-group" });

export { producerGateway, consumerCloud };
