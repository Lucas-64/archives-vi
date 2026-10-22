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
  criarInvestigacao: "/criar/investigacao",
  explorar: "/explorar",
  criadores: "/criadores",
  buscar: "/buscar",
  perfil: (usuario: string) => `/perfil/${usuario}`,
  // Área pessoal (ADR-021). Exige sessão: visitante é redirecionado para /entrar.
  meuPerfil: "/meu-perfil",
  entrar: "/entrar",
  criarConta: "/criar-conta",
} as const;

export interface NavItem {
  label: string;
  // null means the item is visual only ("em breve"): it is shown but has no functional link yet.
  href: string | null;
}

// Main navigation. The prototype items are kept; "Explorar" was added by an approved decision
// (docs/DECISIONS.md, ADR-012).
export const MAIN_NAV: readonly NavItem[] = [
  { label: "Início", href: ROUTES.inicio },
  { label: "Mistérios", href: ROUTES.misterios },
  { label: "Teorias e investigações", href: ROUTES.teorias },
  { label: "Explorar", href: ROUTES.explorar },
  // Mapa, Galeria e Fórum não têm rota: aparecem esmaecidos, como "em breve", sem navegar (ADR-036).
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
