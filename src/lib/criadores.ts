// Busca de criadores pelo campo `usuario`, usado na rota /perfil/[usuario].
// Função pura: recebe a lista (obtida de getCriadores em lib/data.ts) e não acessa dados.
import type { Criador } from "../types/Criador";

export function buscarCriadorPorUsuario(
  criadores: readonly Criador[],
  usuario: string,
): Criador | undefined {
  return criadores.find((criador) => criador.usuario === usuario);
}
