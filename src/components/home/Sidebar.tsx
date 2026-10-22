import { atualizacoes } from "../../mocks/atualizacoes";
import { topicos } from "../../mocks/topicos";
import type { Atualizacao } from "../../types/Atualizacao";
import type { Topico } from "../../types/Topico";
import { ForumTopicList } from "../sidebar/ForumTopicList";
import { UpdateList } from "../sidebar/UpdateList";

export interface SidebarProps {
  topicos: Topico[];
  atualizacoes: Atualizacao[];
}

export function Sidebar({ topicos, atualizacoes }: SidebarProps) {
  return (
    <>
      <ForumTopicList topicos={topicos} />
      <UpdateList atualizacoes={atualizacoes} />
    </>
  );
}

// Coluna direita com um item de exemplo de cada bloco, rotulada como demonstração (ADR-036). Não há fórum nem
// feed de atualizações no backend; os itens vêm de src/mocks/. Quem usar só precisa passar este componente
// como `sidebar` do ContentGrid.
export function SidebarDemonstrativa() {
  return (
    <>
      <ForumTopicList topicos={topicos.slice(0, 1)} demonstracao />
      <UpdateList atualizacoes={atualizacoes.slice(0, 1)} demonstracao />
    </>
  );
}
