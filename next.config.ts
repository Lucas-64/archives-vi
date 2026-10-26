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
      // Rota antiga de criação (antes de "investigação" virar "mistério" na interface).
      { source: "/criar/investigacao", destination: "/criar/misterio", permanent: true },
      {
        source: "/publicacoes",
        has: [{ type: "query", key: "investigacao", value: "(?<slug>.+)" }],
        destination: "/publicacoes/investigacao/:slug",
        permanent: false,
      },
    ];
  },
  compiler: {
    // Lets the SWC compiler add the displayName/SSR class-name support that
    // styled-components needs to produce stable markup between server and client.
    styledComponents: true,
  },
};

export default nextConfig;
