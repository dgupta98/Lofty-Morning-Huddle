import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

let client: ReturnType<typeof createClient> | null = null

export function getInsforgeClient() {
  if (!client) {
    client = createClient(url, anonKey)
  }
  return client
}
