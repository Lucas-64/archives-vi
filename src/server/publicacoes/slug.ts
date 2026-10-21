import { randomBytes } from "node:crypto";

export const SLUG_BASE_MAXIMO = 60;

// "Por que o letreiro da praia aparece duas vezes?" -> "por-que-o-letreiro-da-praia-aparece-duas-vezes".
// Sem acentos, minúsculas, hifens; vazio (título só com símbolos) vira "teoria".
export function slugDoTitulo(titulo: string): string {
  const base = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_BASE_MAXIMO)
    .replace(/-+$/g, "");
  return base || "teoria";
}

// Sufixo curto para desfazer colisões de slug.
export function comSufixoAleatorio(slug: string): string {
  return `${slug}-${randomBytes(4).toString("hex")}`;
}
