import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // In Lovable environments, env vars may come from filesystem .env OR from process env.
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const env: Record<string, string | undefined> = {
    ...fileEnv,
    ...(process.env as Record<string, string | undefined>),
  };

  const FALLBACK_PROJECT_ID = "rodhcrqwunhzgxcopcqk";
  const FALLBACK_URL = `https://${FALLBACK_PROJECT_ID}.supabase.co`;
  const FALLBACK_PUBLISHABLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZGhjcnF3dW5oemd4Y29wY3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDEwNzMsImV4cCI6MjA3NjA3NzA3M30.oAxbzh0ZHBV48DyBUQKX9EX09UOeV4J1tmsboEZnKAg";

  const projectId = env.VITE_SUPABASE_PROJECT_ID || FALLBACK_PROJECT_ID;
  const supabaseUrl =
    env.VITE_SUPABASE_URL || env.SUPABASE_URL || (projectId ? `https://${projectId}.supabase.co` : FALLBACK_URL);
  const supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    FALLBACK_PUBLISHABLE_KEY;

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
    envPrefix: ["VITE_"],
    // Hard-define env vars used by the auto-generated backend client.
    // (This prevents blank-screen crashes when import.meta.env is missing.)
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl ?? ""),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey ?? ""),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(projectId ?? ""),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: [
        {
          find: "@/integrations/supabase/client",
          replacement: path.resolve(__dirname, "./src/integrations/backend/client.ts"),
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
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


