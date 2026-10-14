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
