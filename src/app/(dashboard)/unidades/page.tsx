import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UnidadesClient } from "./client"

export default async function UnidadesPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const departments = await prisma.department.findMany({
    where: { companyId: session.user.companyId },
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <UnidadesClient departments={departments} />
    </div>
  )
}
