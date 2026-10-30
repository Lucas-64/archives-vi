import { z } from "zod";

import { LIMITE_URL_IMAGEM, urlDeImagemPermitida } from "../../lib/urlImagem";

export { LIMITE_URL_IMAGEM, PREFIXO_CAMINHO_IMAGEM, SUFIXO_HOST_BLOB, urlDeImagemPermitida } from "../../lib/urlImagem";

// Campo de imagem dos contratos (capa, evidência, avatar, banner, publicação): só a URL pública do Vercel Blob
// devolvida pelo envio (ADR-043).
export const esquemaUrlImagem = z
  .string({ error: "Informe a imagem." })
  .trim()
  .max(LIMITE_URL_IMAGEM, "O endereço da imagem é longo demais.")
  .refine(urlDeImagemPermitida, "Envie a imagem pelo campo de upload.");
