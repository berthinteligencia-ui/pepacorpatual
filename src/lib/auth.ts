import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        console.error("[AUTH] DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 80))

        let user
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { company: { select: { id: true, name: true, cnpj: true } } },
          })
        } catch (e: any) {
          console.error("[AUTH] DB error:", e.message)
          return null
        }

        console.log("[AUTH] user found:", !!user, "email:", credentials.email)

        if (!user || !user.active) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        console.log("[AUTH] password valid:", valid)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company.name,
          companyCnpj: user.company.cnpj || "",
        }
      },
    }),
  ],
})
