// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null  
      image?: string | null
    }
  }
}