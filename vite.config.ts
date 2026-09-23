import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { brittContent } from "./vite.content-plugin.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), brittContent()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("three") || id.includes("@react-three")) return "stage";
        },
      },
    },
  },
});
