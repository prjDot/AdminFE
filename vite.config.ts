import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const apiProxyTarget =
    process.env.VITE_API_PROXY_TARGET ||
    process.env.VITE_API_URL ||
    "https://paw.gbsw.hs.kr"

  return {
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
        react: path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: mode !== "development",
        },
      },
    },
  }
})
