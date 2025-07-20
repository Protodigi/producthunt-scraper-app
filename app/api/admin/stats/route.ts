import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, analysisReports, workflows, workflowExecutions } from '@/lib/db/schema'
import { eq, desc, gte, and, sql } from 'drizzle-orm'
import { DashboardStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Get total counts
    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)

    const [analysisCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(analysisReports)

    const [activeWorkflowCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflows)
      .where(eq(workflows.isActive, true))

    // Get recent executions
    const recentExecutions = await db
      .select()
      .from(workflowExecutions)
      .orderBy(desc(workflowExecutions.startedAt))
      .limit(10)

    // Get top products by votes
    const topProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.votesCount))
      .limit(5)

    // Get analysis breakdown by type
    const analysisByType = await db
      .select({
        analysisType: analysisReports.analysisType,
        count: sql<number>`count(*)`,
      })
      .from(analysisReports)
      .groupBy(analysisReports.analysisType)

    // Get analysis breakdown by confidence
    const analysisByConfidence = await db
      .select({
        high: sql<number>`count(*) filter (where ${analysisReports.confidence} >= 80)`,
        medium: sql<number>`count(*) filter (where ${analysisReports.confidence} >= 50 and ${analysisReports.confidence} < 80)`,
        low: sql<number>`count(*) filter (where ${analysisReports.confidence} < 50)`,
      })
      .from(analysisReports)

    // Get trends data (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const productsTrend = await db
      .select({
        date: sql<string>`date(${products.createdAt})`,
        value: sql<number>`count(*)`,
      })
      .from(products)
      .where(gte(products.createdAt, sevenDaysAgo))
      .groupBy(sql`date(${products.createdAt})`)
      .orderBy(sql`date(${products.createdAt})`)

    const analysisTrend = await db
      .select({
        date: sql<string>`date(${analysisReports.createdAt})`,
        value: sql<number>`count(*)`,
      })
      .from(analysisReports)
      .where(gte(analysisReports.createdAt, sevenDaysAgo))
      .groupBy(sql`date(${analysisReports.createdAt})`)
      .orderBy(sql`date(${analysisReports.createdAt})`)

    // Construct the stats object
    const stats: DashboardStats = {
      totalProducts: productCount.count || 0,
      totalAnalysis: analysisCount.count || 0,
      activeWorkflows: activeWorkflowCount.count || 0,
      recentExecutions: recentExecutions as any[],
      topProducts: topProducts as any[],
      analysisBreakdown: {
        byType: analysisByType.reduce((acc, item) => {
          acc[item.analysisType] = item.count
          return acc
        }, {} as Record<string, number>),
        byConfidence: analysisByConfidence[0] || { high: 0, medium: 0, low: 0 },
      },
      trends: {
        productsOverTime: productsTrend.map(item => ({
          date: item.date,
          value: item.value,
        })),
        analysisOverTime: analysisTrend.map(item => ({
          date: item.date,
          value: item.value,
        })),
        votesOverTime: [], // TODO: Implement votes over time tracking
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}