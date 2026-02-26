"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getCompanySettings() {
    const session = await auth()
    if (!session?.user?.companyId) return null

    let company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        include: { settings: true }
    })

    // Ensure settings exist
    if (company && !company.settings) {
        const settings = await prisma.settings.create({
            data: { companyId: session.user.companyId }
        })
        company = { ...company, settings }
    }

    return company
}

export async function updateCompanySettings(data: {
    name?: string
    cnpj?: string
    whatsapp?: string
    email?: string
    address?: string
    city?: string
    state?: string
    settings?: {
        whatsappNotifications?: boolean
        autoBackup?: boolean
        payrollReminderDays?: number
    }
}) {
    const session = await auth()
    if (!session?.user?.companyId) {
        throw new Error("Não autorizado")
    }

    const { settings, ...companyData } = data

    const updated = await prisma.company.update({
        where: { id: session.user.companyId },
        data: {
            ...companyData,
            settings: settings ? {
                upsert: {
                    create: settings,
                    update: settings
                }
            } : undefined
        },
        include: { settings: true }
    })

    revalidatePath("/(dashboard)/configuracoes")
    revalidatePath("/dashboard")

    return updated
}
