"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getDashboardData(month?: number, year?: number) {
    const session = await auth()
    if (!session?.user?.companyId) return null

    const companyId = session.user.companyId
    const now = new Date()
    const currentMonth = month ?? now.getMonth() + 1
    const currentYear = year ?? now.getFullYear()

    // Previous month for variation - JS Date handles underflow automatically
    const prevDate = new Date(currentYear, currentMonth - 2, 1)
    const prevMonth = prevDate.getMonth() + 1
    const prevYear = prevDate.getFullYear()

    // 1. Fetch all departments
    const departments = await prisma.department.findMany({
        where: { companyId },
        include: {
            _count: {
                select: { employees: { where: { status: "ACTIVE" } } }
            }
        }
    })

    // 2. Fetch payroll analyses for current month
    const currentAnalyses = await prisma.payrollAnalysis.findMany({
        where: {
            companyId,
            month: currentMonth,
            year: currentYear
        }
    })

    // 3. Fetch payroll analyses for previous month
    const prevAnalyses = await prisma.payrollAnalysis.findMany({
        where: {
            companyId,
            month: prevMonth,
            year: prevYear
        }
    })

    // 4. Calculate KPIs
    const totalCost = currentAnalyses.reduce((acc, curr) => acc + Number(curr.total), 0)
    const prevTotalCost = prevAnalyses.reduce((acc, curr) => acc + Number(curr.total), 0)

    const totalEmployees = await prisma.employee.count({
        where: { companyId, status: "ACTIVE" }
    })

    const unitClosings = currentAnalyses.length
    const totalUnits = departments.length
    const closingProgress = totalUnits > 0 ? Math.round((unitClosings / totalUnits) * 100) : 0

    const variation = prevTotalCost > 0
        ? ((totalCost - prevTotalCost) / prevTotalCost) * 100
        : 0

    // 5. Build Unit List
    const unitList = departments.map(dept => {
        const analysis = currentAnalyses.find(a => a.departmentId === dept.id)
        return {
            id: dept.id,
            name: dept.name,
            code: `UNIT-${dept.id.slice(-4).toUpperCase()}`,
            manager: "Gerente Unidade", // Placeholder as not in schema
            status: analysis ? "FECHADO" : "PENDENTE",
            headcount: dept._count.employees,
            cost: analysis ? Number(analysis.total) : 0
        }
    })

    // 6. Generate Alerts
    const alerts = unitList
        .filter(u => u.status === "PENDENTE")
        .map(u => ({
            type: "FECHAMENTO PENDENTE",
            time: "Aguardando",
            message: `A unidade ${u.name} ainda não realizou o fechamento da folha para ${currentMonth}/${currentYear}.`,
            borderColor: "border-amber-500",
            bg: "bg-amber-50",
            badge: "bg-amber-100 text-amber-700"
        }))

    // Add budget over alert if cost > 100k (example logic)
    unitList.forEach(u => {
        if (u.cost > 100000) {
            alerts.push({
                type: "ALERTA DE CUSTO",
                time: "Hoje",
                message: `A unidade ${u.name} ultrapassou R$ 100k em custo de folha.`,
                borderColor: "border-red-500",
                bg: "bg-red-50",
                badge: "bg-red-100 text-red-700"
            })
        }
    })

    return {
        kpis: {
            totalCost,
            totalEmployees,
            unitClosings,
            totalUnits,
            closingProgress,
            variation
        },
        unitList,
        alerts,
        period: {
            month: currentMonth,
            year: currentYear
        }
    }
}
