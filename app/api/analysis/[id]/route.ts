import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, analysisReports, workflows } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validate ID parameter
const idSchema = z.string().regex(/^\d+$/, 'ID must be a valid number');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }
    // Validate the ID parameter
    const validationResult = idSchema.safeParse(params.id);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid analysis report ID',
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const reportId = parseInt(params.id, 10);

    // Fetch the analysis report with workflow information
    const [report] = await db
      .select({
        id: analysisReports.id,
        title: analysisReports.title,
        content: analysisReports.content,
        productsAnalyzed: analysisReports.productsAnalyzed,
        workflowId: analysisReports.workflowId,
        analyzedAt: analysisReports.analyzedAt,
        createdAt: analysisReports.createdAt,
        workflow: {
          id: workflows.id,
          name: workflows.name,
          type: workflows.type,
          webhookUrl: workflows.webhookUrl,
          isActive: workflows.isActive,
          lastExecuted: workflows.lastExecuted,
          createdAt: workflows.createdAt,
          updatedAt: workflows.updatedAt,
        },
      })
      .from(analysisReports)
      .leftJoin(workflows, eq(analysisReports.workflowId, workflows.id))
      .where(eq(analysisReports.id, reportId))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Analysis report not found',
          },
        },
        { status: 404 }
      );
    }

    // Parse the JSON content
    const transformedReport = {
      id: report.id,
      title: report.title,
      content: report.content ? JSON.parse(report.content) : null,
      productsAnalyzed: report.productsAnalyzed,
      workflowId: report.workflowId,
      analyzedAt: report.analyzedAt,
      createdAt: report.createdAt,
      workflow: report.workflow,
    };

    return NextResponse.json({
      success: true,
      data: transformedReport,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching analysis report:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the analysis report',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 }
    );
  }
}