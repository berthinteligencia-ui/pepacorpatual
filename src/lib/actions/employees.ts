"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function getCompanyId() {
  const session = await auth()
  if (!session?.user?.companyId) throw new Error("Não autenticado")
  return session.user.companyId
}

export async function createEmployee(data: {
  name: string
  position: string
  salary: number
  hireDate: string
  departmentId?: string
  cpf?: string
  email?: string
  phone?: string
}) {
  const companyId = await getCompanyId()
  await prisma.employee.create({
    data: {
      ...data,
      salary: data.salary,
      hireDate: new Date(data.hireDate),
      companyId,
      departmentId: data.departmentId || null,
    },
  })
  revalidatePath("/funcionarios")
}

export async function updateEmployee(
  id: string,
  data: {
    name: string
    position: string
    salary: number
    hireDate: string
    departmentId?: string
    cpf?: string
    email?: string
    phone?: string
    status: string
  }
) {
  const companyId = await getCompanyId()
  await prisma.employee.update({
    where: { id, companyId },
    data: {
      ...data,
      salary: data.salary,
      hireDate: new Date(data.hireDate),
      departmentId: data.departmentId || null,
      status: data.status as "ACTIVE" | "INACTIVE" | "ON_LEAVE",
    },
  })
  revalidatePath("/funcionarios")
}

export async function deleteEmployee(id: string) {
  const companyId = await getCompanyId()
  await prisma.employee.delete({ where: { id, companyId } })
  revalidatePath("/funcionarios")
}

export async function registerBatchFromPayroll(
  employees: { cpf: string; nome: string; valor: number }[],
  departmentId: string
) {
  const companyId = await getCompanyId()
  await prisma.employee.createMany({
    data: employees.map((e) => ({
      name: e.nome,
      cpf: e.cpf,
      position: "A definir",
      salary: e.valor,
      hireDate: new Date(),
      companyId,
      departmentId,
    })),
    skipDuplicates: true,
  })
  revalidatePath("/funcionarios")
  revalidatePath("/folha-pagamento")
}

export async function deleteEmployeesBatch(ids: string[]) {
  const companyId = await getCompanyId()
  await prisma.employee.deleteMany({
    where: {
      id: { in: ids },
      companyId,
    },
  })
  revalidatePath("/funcionarios")
}
export async function getEmployeeByCpf(cpf: string) {
  const companyId = await getCompanyId()
  const cleanCpf = cpf.replace(/\D/g, "")
  return prisma.employee.findFirst({
    where: { cpf: cleanCpf, companyId },
    select: { id: true, name: true, cpf: true }
  })
}
