import type { TagTematica } from "../constants/tagsTematicas";
import type { Patente } from "./Patente";

export interface Criador {
  id: string;
  usuario: string;
  nome: string;
  bio: string;
  // Imagens enviadas pela pessoa (URL pública do Vercel Blob, ADR-043). Sem elas: iniciais e nenhum banner.
  avatar?: string;
  banner?: string;
}

// Criador na lista de /criadores: além da identidade, até 3 temas reais do conteúdo público e a patente.
// A patente ainda não existe na API (ADR-019, ADR-037): só a conta de demonstração a tem, e `patenteDemonstracao`
// marca isso. Sem patente, a interface diz que não está definida.
export interface CriadorListado extends Criador {
  temas: TagTematica[];
  patente?: Patente;
  patenteDemonstracao?: boolean;
}
