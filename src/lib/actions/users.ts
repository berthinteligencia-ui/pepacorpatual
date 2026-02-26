"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

async function getCompanyId() {
  const session = await auth()
  if (!session?.user?.companyId) throw new Error("Não autenticado")
  return session.user.companyId
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  const companyId = await getCompanyId()
  const password = await bcrypt.hash(data.password, 12)
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password,
      role: data.role as "ADMIN" | "RH" | "GESTOR" | "FUNCIONARIO",
      companyId,
    },
  })
  revalidatePath("/usuarios")
}

export async function updateUser(
  id: string,
  data: { name: string; email: string; role: string; active: boolean; password?: string }
) {
  const companyId = await getCompanyId()
  const update: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    role: data.role as "ADMIN" | "RH" | "GESTOR" | "FUNCIONARIO",
    active: data.active,
  }
  if (data.password) {
    update.password = await bcrypt.hash(data.password, 12)
  }
  await prisma.user.update({ where: { id, companyId }, data: update })
  revalidatePath("/usuarios")
}

export async function deleteUser(id: string) {
  const companyId = await getCompanyId()
  await prisma.user.delete({ where: { id, companyId } })
  revalidatePath("/usuarios")
}
