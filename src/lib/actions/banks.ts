"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createBank(data: { name: string; code: string }) {
  await prisma.bank.create({ data })
  revalidatePath("/bancos")
}

export async function updateBank(id: string, data: { name: string; code: string; active: boolean }) {
  await prisma.bank.update({ where: { id }, data })
  revalidatePath("/bancos")
}

export async function deleteBank(id: string) {
  await prisma.bank.delete({ where: { id } })
  revalidatePath("/bancos")
}
