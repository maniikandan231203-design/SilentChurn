import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export function createAdminClient(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jehaenmqezenfuamgqch.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Falling back to anon key.");
  }

  return (createClient as any)(supabaseUrl, serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
    db: {
      schema: "silent_churn",
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
