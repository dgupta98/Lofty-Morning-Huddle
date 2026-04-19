import { createClient, InsForgeClient } from "@insforge/sdk"

const url = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

let client: InsForgeClient | null = null

export function getInsforgeClient(): InsForgeClient {
  if (!client) {
    client = createClient({ baseUrl: url, anonKey })
  }
  return client
}
