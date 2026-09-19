import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // A folha é estática: os dados vêm do YAML normalizado em tempo de build/render
  // no servidor. Nenhuma fonte viva é consultada pela rota de preview.
  outputFileTracingIncludes: {
    "/preview/[sprintId]": ["./data/**", "./spec/**"],
  },
};

export default config;
