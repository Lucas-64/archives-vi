import { PaginaNaoEncontrada } from "../../components/states/PaginaNaoEncontrada";

// Sem o SiteShell: o layout do grupo (detalhe) já o aplica. Sem este arquivo, o not-found da raiz renderizaria
// um segundo cabeçalho e rodapé dentro do shell do grupo.
export default function DetalheNaoEncontrado() {
  return <PaginaNaoEncontrada />;
}
