import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "webview-src/index.tsx",
      output: {
        entryFileNames: "webview.js",
        assetFileNames: "webview.css",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./webview-src"),
    },
  },
})
