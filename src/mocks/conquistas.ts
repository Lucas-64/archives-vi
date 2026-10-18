// DADOS DEMONSTRATIVOS. Nomes de conquistas inspirados nos exemplos conceituais de
// docs/features/perfil-social.md, seção 2. Não há regra de desbloqueio: são só rótulos.
import type { Conquista } from "@/types/Conquista";

// Chave: id do criador (Criador.id). Criador sem entrada aqui mostra o estado vazio.
export const conquistasPorCriador: Partial<Record<string, Conquista[]>> = {
  "analista-vb": [
    { id: "documentacao-rigorosa", nome: "Documentação Rigorosa" },
    { id: "colaborador-recorrente", nome: "Colaborador Recorrente" },
  ],
  "noturno-leonida": [{ id: "evidencia-decisiva", nome: "Evidência Decisiva" }],
  "arquivista-99": [
    { id: "documentacao-rigorosa", nome: "Documentação Rigorosa" },
    { id: "evidencia-decisiva", nome: "Evidência Decisiva" },
    { id: "pesquisador-multijogo", nome: "Pesquisador Multijogo" },
  ],
};
