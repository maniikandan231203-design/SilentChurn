import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export function createClient(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jehaenmqezenfuamgqch.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return (createBrowserClient as any)(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: "silent_churn",
    },
  });
}
