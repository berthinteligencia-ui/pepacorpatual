import { prisma } from "@/lib/prisma"
import { BancosClient } from "./client"

export default async function BancosPage() {
  const banks = await prisma.bank.findMany({ orderBy: { code: "asc" } })

  return (
    <div className="space-y-6">
      <BancosClient banks={banks} />
    </div>
  )
}
