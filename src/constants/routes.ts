export const ROUTES = {
  inicio: "/",
  // Mistério: postagem simples (ADR-044). Investigação: objeto rico, com evidências e discussão.
  misterios: "/misterios",
  misterio: (slug: string) => `/misterios/${slug}`,
  // Publicações antigas (teorias criadas antes do ADR-044). Sem tela de criação.
  teorias: "/publicacoes",
  investigacoes: "/investigacoes",
  investigacao: (slug: string) => `/investigacoes/${slug}`,
  // Mantido por compatibilidade: a área comunitária é a própria página da investigação.
  comunidadeInvestigacao: (slug: string) => `/investigacoes/${slug}`,
  publicacoes: "/publicacoes",
  publicacao: (slug: string) => `/publicacao/${slug}`,
  criar: "/criar/investigacao",
  criarInvestigacao: "/criar/investigacao",
  criarMisterio: "/criar/misterio",
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
  { label: "Investigações", href: ROUTES.investigacoes },
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
  { label: "Investigações", href: ROUTES.investigacoes },
  { label: "Criar", href: ROUTES.criar },
  { label: "Buscar", href: ROUTES.buscar },
];
