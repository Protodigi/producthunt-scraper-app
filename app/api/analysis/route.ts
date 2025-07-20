import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, analysisReports, workflows } from '@/lib/db';
import { eq, and, gte, lte, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';

// Input validation schema
const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  pageSize: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  workflowId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['analyzedAt', 'productsAnalyzed']).optional().default('analyzedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function GET(request: NextRequest) {
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
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validationResult = querySchema.safeParse(searchParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { page, pageSize, workflowId, startDate, endDate, sortBy, sortOrder } = validationResult.data;

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAGINATION',
            message: 'Invalid pagination parameters. Page must be >= 1, pageSize must be between 1 and 100.',
          },
        },
        { status: 400 }
      );
    }

    // Build where conditions
    const whereConditions = [];

    if (workflowId) {
      whereConditions.push(eq(analysisReports.workflowId, workflowId));
    }

    if (startDate) {
      const startDateTime = new Date(startDate);
      if (isNaN(startDateTime.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_DATE',
              message: 'Invalid start date format',
            },
          },
          { status: 400 }
        );
      }
      whereConditions.push(gte(analysisReports.analyzedAt, startDateTime));
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      if (isNaN(endDateTime.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_DATE',
              message: 'Invalid end date format',
            },
          },
          { status: 400 }
        );
      }
      // Set to end of day
      endDateTime.setHours(23, 59, 59, 999);
      whereConditions.push(lte(analysisReports.analyzedAt, endDateTime));
    }

    // Get total count for pagination
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    const [countResult] = await db
      .select({ count: count() })
      .from(analysisReports)
      .where(whereClause);

    const totalItems = countResult?.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const offset = (page - 1) * pageSize;

    // Build order by clause
    const orderByColumn = sortBy === 'productsAnalyzed' 
      ? analysisReports.productsAnalyzed 
      : analysisReports.analyzedAt;
    const orderByClause = sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    // Fetch analysis reports with workflow information
    const reports = await db
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
        },
      })
      .from(analysisReports)
      .leftJoin(workflows, eq(analysisReports.workflowId, workflows.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    // Transform the results - content is already JSON type, no parsing needed
    const transformedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      content: report.content,
      productsAnalyzed: report.productsAnalyzed,
      workflowId: report.workflowId,
      analyzedAt: report.analyzedAt,
      createdAt: report.createdAt,
      workflow: report.workflow,
    }));

    return NextResponse.json({
      success: true,
      data: transformedReports,
      metadata: {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analysis reports:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching analysis reports',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 }
    );
  }
}