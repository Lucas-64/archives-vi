import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The project documents agent rules in AGENT.md; skip the generated AGENTS.md.
  agentRules: false,
  compiler: {
    // Lets the SWC compiler add the displayName/SSR class-name support that
    // styled-components needs to produce stable markup between server and client.
    styledComponents: true,
  },
};

export default nextConfig;
