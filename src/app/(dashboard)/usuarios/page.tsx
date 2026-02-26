import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsuariosClient } from "./client"

export default async function UsuariosPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  return (
    <div className="space-y-6">
      <UsuariosClient users={users} currentUserId={session.user.id!} />
    </div>
  )
}
