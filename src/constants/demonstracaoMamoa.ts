import type { PatentesDoMembro } from "../types/Patente";

// DADOS DE DEMONSTRAÇÃO, PROVISÓRIOS (ADR-037). Não vêm do backend: não há tabela nem API de patentes ou tags.
// Valem só para a conta "mamoa" e aparecem rotulados como demonstração. Remover este arquivo e o uso em
// `src/app/(detalhe)/meu-perfil/page.tsx` quando houver dado real.
export const USUARIO_DEMONSTRACAO = "mamoa";

export interface DemonstracaoDoPerfil {
  tags: readonly string[];
  patentes: PatentesDoMembro;
}

export const DEMONSTRACAO_MAMOA: DemonstracaoDoPerfil = {
  tags: ["Caçador de easter eggs", "Ufólogo", "Documentação rigorosa"],
  patentes: {
    atual: { id: "investigador", nome: "Investigador" },
    anteriores: [
      { id: "observador", nome: "Observador" },
      { id: "analista-de-campo", nome: "Analista de Campo" },
    ],
  },
};

// Devolve a demonstração só para o usuário "mamoa". Os demais ficam com o estado vazio.
export function demonstracaoDoUsuario(usuario: string): DemonstracaoDoPerfil | undefined {
  return usuario === USUARIO_DEMONSTRACAO ? DEMONSTRACAO_MAMOA : undefined;
}
