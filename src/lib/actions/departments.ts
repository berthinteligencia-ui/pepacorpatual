"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function getCompanyId() {
  const session = await auth()
  if (!session?.user?.companyId) throw new Error("Não autenticado")
  return session.user.companyId
}

export async function createDepartment(data: { name: string }) {
  const companyId = await getCompanyId()
  await prisma.department.create({ data: { ...data, companyId } })
  revalidatePath("/unidades")
}

export async function updateDepartment(id: string, data: { name: string }) {
  const companyId = await getCompanyId()
  await prisma.department.update({ where: { id, companyId }, data })
  revalidatePath("/unidades")
}

export async function deleteDepartment(id: string) {
  const companyId = await getCompanyId()
  await prisma.department.delete({ where: { id, companyId } })
  revalidatePath("/unidades")
}
