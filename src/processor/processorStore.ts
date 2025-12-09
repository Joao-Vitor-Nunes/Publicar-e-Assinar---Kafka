import { Medias } from "./processorService";

const bufferMedias: Medias[] = [];

export function adicionarMedia(media: Medias[]): void {
  bufferMedias.push(...media);
}

export function obterMedias(): Medias[] {
  return bufferMedias;
}

export function limparMedias(): void {
  bufferMedias.length = 0;
}
