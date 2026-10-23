
import { defineConfig, loadEnv } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } }, // même alias que Next
  // @ts-expect-error - requis si les types ne se synchronisent pas immédiatement
  test: {
    env: loadEnv("test", process.cwd(), ""), // charge .env.test
  },
});

