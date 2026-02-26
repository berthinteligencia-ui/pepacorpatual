import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FolhaPagamentoClient } from "./client"

export default async function FolhaPagamentoPage() {
    const session = await auth()
    if (!session?.user?.companyId) redirect("/login")

    const departments = await prisma.department.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { name: "asc" },
    })

    return (
        <div className="space-y-6">
            <FolhaPagamentoClient departments={departments} />
        </div>
    )
}
