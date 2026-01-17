import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Ensure VITE_* vars are available during both dev + build in Lovable environments.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
    },
    envPrefix: ["VITE_"],
    // Hard-define env vars used by the auto-generated supabase client.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(env.VITE_SUPABASE_PROJECT_ID),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-slot", "@radix-ui/react-toast"],
            animations: ["framer-motion"],
            icons: ["lucide-react"],
          },
        },
      },
    },
  };
});

