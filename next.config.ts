import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The project documents agent rules in AGENT.md; skip the generated AGENTS.md.
  agentRules: false,
  // Forma antiga de consulta da discussão (?investigacao=slug, etapa anterior). O redirecionamento é feito
  // na configuração, antes da renderização, para que um slug inexistente chegue à rota dedicada e
  // responda 404 real. A página /publicacoes nunca renderiza a listagem para esse parâmetro.
  async redirects() {
    return [
      // ADR-044: a área comunitária da investigação passa a ser a própria página da investigação.
      { source: "/publicacoes/investigacao/:slug", destination: "/investigacoes/:slug", permanent: true },
      {
        source: "/publicacoes",
        has: [{ type: "query", key: "investigacao", value: "(?<slug>.+)" }],
        destination: "/investigacoes/:slug",
        permanent: false,
      },
      // "Criar teoria" simples deixou de existir: /criar abre o formulário de investigação.
      { source: "/criar", destination: "/criar/investigacao", permanent: true },
    ];
  },
  // Imagens enviadas pela pessoa ficam no Vercel Blob (ADR-043): só o host público do Blob, dentro de imagens/.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/imagens/**" }],
  },
  compiler: {
    // Lets the SWC compiler add the displayName/SSR class-name support that
    // styled-components needs to produce stable markup between server and client.
    styledComponents: true,
  },
};

export default nextConfig;
