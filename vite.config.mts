/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const isTest = !!process.env.VITEST || process.env.NODE_ENV === "test";

export default defineConfig({
  plugins: isTest
    ? []
    : [cloudflare({ viteEnvironment: { name: "worker" } }), redwood()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
