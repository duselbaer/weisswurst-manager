import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { users } from "./db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string)
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isValid) return null

        return user
      }
    })
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  }
})
