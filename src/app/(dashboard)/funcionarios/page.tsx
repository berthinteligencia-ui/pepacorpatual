import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FuncionariosClient } from "./client"

export default async function FuncionariosPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const [rawEmployees, departments] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId: session.user.companyId },
      include: { department: true },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { name: "asc" },
    }),
  ])

  // Decimal is not JSON-serializable — convert to number
  const employees = rawEmployees.map((e) => ({ ...e, salary: Number(e.salary) }))

  return (
    <div className="space-y-6">
      <FuncionariosClient employees={employees} departments={departments} />
    </div>
  )
}
