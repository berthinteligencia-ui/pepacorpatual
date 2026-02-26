"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function getCompanyId() {
    const session = await auth()
    if (!session?.user?.companyId) throw new Error("Não autenticado")
    return session.user.companyId
}

export async function savePayrollAnalysis(data: {
    id?: string
    month: number
    year: number
    departmentId?: string | null
    total: number
    analysisData: any // { found, missing, extras, sheetSummary }
}) {
    const companyId = await getCompanyId()

    const payload = {
        month: data.month,
        year: data.year,
        departmentId: data.departmentId || null,
        companyId,
        total: data.total,
        data: data.analysisData,
        status: "OPEN"
    }

    if (data.id) {
        await prisma.payrollAnalysis.update({
            where: { id: data.id, companyId },
            data: payload
        })
    } else {
        // Upsert based on month/year/unit/company
        await prisma.payrollAnalysis.upsert({
            where: {
                month_year_unit_company: {
                    month: data.month,
                    year: data.year,
                    departmentId: (data.departmentId as string) || "",
                    companyId
                }
            },
            update: payload,
            create: payload
        })
    }

    revalidatePath("/folha-pagamento")
}

export async function listPayrollAnalyses() {
    const companyId = await getCompanyId()
    const results = await prisma.payrollAnalysis.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        include: {
            department: {
                select: { name: true }
            }
        }
    })
    return results.map(r => ({
        ...r,
        total: Number(r.total)
    }))
}

export async function getPayrollAnalysis(id: string) {
    const companyId = await getCompanyId()
    const result = await prisma.payrollAnalysis.findUnique({
        where: { id, companyId }
    })
    if (!result) return null
    return {
        ...result,
        total: Number(result.total)
    }
}

export async function deletePayrollAnalysis(id: string) {
    const companyId = await getCompanyId()
    await prisma.payrollAnalysis.delete({
        where: { id, companyId }
    })
    revalidatePath("/folha-pagamento")
}
