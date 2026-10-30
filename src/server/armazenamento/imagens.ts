import { randomUUID } from "node:crypto";

import sharp from "sharp";

// Armazenamento e preparo de imagens enviadas (ADR-043). Só jpeg, png e webp, no máximo 5 MB, reconhecidos pelo
// CONTEÚDO (não pelo Content-Type nem pelo nome), redimensionados para no máximo 1920 px de largura e gravados com
// nome gerado no servidor (o nome original nunca é usado).
export const TIPOS_IMAGEM = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
export type TipoImagem = keyof typeof TIPOS_IMAGEM;

export const LIMITE_IMAGEM_BYTES = 5 * 1024 * 1024;
export const LARGURA_MAXIMA_IMAGEM = 1920;

// Reconhece o formato pelos primeiros bytes (assinatura do arquivo).
export function detectarTipoImagem(bytes: Uint8Array): TipoImagem | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return "image/png";
  const texto = (inicio: number, fim: number) => String.fromCharCode(...bytes.slice(inicio, fim));
  if (bytes.length >= 12 && texto(0, 4) === "RIFF" && texto(8, 12) === "WEBP") return "image/webp";
  return null;
}

export interface ImagemPreparada {
  dados: Buffer;
  tipo: TipoImagem;
  largura: number;
  altura: number;
}

// Decodifica (recusa arquivo corrompido), corrige a orientação, limita a largura a 1920 px sem ampliar e
// regrava no mesmo formato, o que também remove metadados (EXIF, localização).
export async function prepararImagem(bytes: Buffer, tipo: TipoImagem): Promise<ImagemPreparada> {
  const base = sharp(bytes, { failOn: "error", limitInputPixels: 80_000_000 }).rotate().resize({
    width: LARGURA_MAXIMA_IMAGEM,
    withoutEnlargement: true,
  });
  const convertida = tipo === "image/png" ? base.png({ compressionLevel: 9 }) : tipo === "image/webp" ? base.webp({ quality: 82 }) : base.jpeg({ quality: 82, mozjpeg: true });
  const { data, info } = await convertida.toBuffer({ resolveWithObject: true });
  return { dados: data, tipo, largura: info.width, altura: info.height };
}

// Caminho gerado no servidor: nunca contém o nome original.
export function novoCaminhoImagem(tipo: TipoImagem): string {
  return `imagens/${randomUUID()}.${TIPOS_IMAGEM[tipo]}`;
}

// Gravação pública. A implementação real é o Vercel Blob; os testes injetam uma simulada.
export interface ArmazenamentoImagens {
  salvar(caminho: string, dados: Buffer, tipo: TipoImagem): Promise<string>;
}

export function armazenamentoConfigurado(ambiente: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(ambiente.BLOB_READ_WRITE_TOKEN);
}

// Vercel Blob, com o token do ambiente (`BLOB_READ_WRITE_TOKEN`; nunca vai ao navegador nem ao repositório).
// Sem token, devolve null e a rota responde 503 com mensagem clara. Não há outro caminho de armazenamento.
export function armazenamentoVercelBlob(ambiente: NodeJS.ProcessEnv = process.env): ArmazenamentoImagens | null {
  const token = ambiente.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  return {
    async salvar(caminho, dados, tipo) {
      const { put } = await import("@vercel/blob");
      const resultado = await put(caminho, dados, {
        access: "public",
        contentType: tipo,
        addRandomSuffix: false,
        allowOverwrite: false,
        token,
      });
      return resultado.url;
    },
  };
}
