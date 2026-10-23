import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Flat config for ESLint 9 using the Next.js rules.
// The legacy shadcn folder (src/app/components) is excluded: it is frozen by ADR-006.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "dist/**", // stale Vite build output (gitignored), kept until cleanup is approved
    "node_modules/**",
    "next-env.d.ts",
    "src/app/components/**",
    // Scripts avulsos de diagnóstico de migração (CommonJS, fora do app): não são código do produto.
    "diagnostico-migracao.cjs",
    "diagnostico-neon.cjs",
    "verificar-migracoes.cjs",
  ]),
]);
