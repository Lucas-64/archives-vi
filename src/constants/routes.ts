export const ROUTES = {
  inicio: "/",
  misterios: "/investigacoes",
  teorias: "/publicacoes",
  investigacoes: "/investigacoes",
  investigacao: (slug: string) => `/investigacoes/${slug}`,
  // Área comunitária de uma investigação (teoria, evidências, discussão, localização, histórico e síntese).
  comunidadeInvestigacao: (slug: string) => `/publicacoes/investigacao/${slug}`,
  publicacoes: "/publicacoes",
  publicacao: (slug: string) => `/publicacao/${slug}`,
  criar: "/criar",
  explorar: "/explorar",
  criadores: "/criadores",
  buscar: "/buscar",
  perfil: (usuario: string) => `/perfil/${usuario}`,
  // Área pessoal demonstrativa (ADR-021). Sem login: não há conta real por trás da página.
  meuPerfil: "/meu-perfil",
  entrar: "/entrar",
  criarConta: "/criar-conta",
} as const;

export interface NavItem {
  label: string;
  // null means the item is visual only: it is shown but has no functional link yet.
  href: string | null;
}

// Main navigation. The prototype items are kept; "Explorar" was added by an approved decision
// (docs/DECISIONS.md, ADR-012).
export const MAIN_NAV: readonly NavItem[] = [
  { label: "Início", href: ROUTES.inicio },
  { label: "Mistérios", href: ROUTES.misterios },
  { label: "Teorias e investigações", href: ROUTES.teorias },
  { label: "Explorar", href: ROUTES.explorar },
  { label: "Mapa", href: null },
  { label: "Galeria", href: null },
  { label: "Fórum", href: null },
];

// Items for the mobile bottom bar. Only functional routes are included, so href is required.
export const MOBILE_NAV: readonly (NavItem & { href: string })[] = [
  { label: "Início", href: ROUTES.inicio },
  { label: "Mistérios", href: ROUTES.misterios },
  { label: "Teorias", href: ROUTES.teorias },
  { label: "Criar", href: ROUTES.criar },
  { label: "Buscar", href: ROUTES.buscar },
];
