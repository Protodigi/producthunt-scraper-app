import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, workflows } from '@/lib/db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { z } from 'zod';

// Schema for GET request query parameters
const getProductsSchema = z.object({
  workflowId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().default('50'),
  offset: z.string().optional().default('0'),
});

// Schema for POST request body
const createProductSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url(),
  productHuntUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  votesCount: z.number().int().min(0).default(0),
  commentsCount: z.number().int().min(0).optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featuredAt: z.string().datetime().optional(),
  launchedAt: z.string().datetime().optional(),
  workflowId: z.number().optional(),
  scrapedAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      workflowId: searchParams.get('workflowId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    };

    const validatedParams = getProductsSchema.parse(params);

    // Build query conditions
    const conditions = [];
    
    if (validatedParams.workflowId) {
      conditions.push(eq(products.workflowId, parseInt(validatedParams.workflowId)));
    }
    
    if (validatedParams.startDate) {
      conditions.push(gte(products.scrapedAt, new Date(validatedParams.startDate)));
    }
    
    if (validatedParams.endDate) {
      conditions.push(lte(products.scrapedAt, new Date(validatedParams.endDate)));
    }

    // Execute query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const result = await db
      .select({
        product: products,
        workflow: workflows,
      })
      .from(products)
      .leftJoin(workflows, eq(products.workflowId, workflows.id))
      .where(whereClause)
      .orderBy(desc(products.scrapedAt))
      .limit(parseInt(validatedParams.limit))
      .offset(parseInt(validatedParams.offset));

    // Format response
    const formattedProducts = result.map(({ product, workflow }) => ({
      id: product.id,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      url: product.url,
      productHuntUrl: product.productHuntUrl,
      thumbnailUrl: product.thumbnailUrl,
      votesCount: product.votesCount,
      commentsCount: product.commentsCount,
      categories: product.categories,
      tags: product.tags,
      featuredAt: product.featuredAt,
      launchedAt: product.launchedAt,
      scrapedAt: product.scrapedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      workflow: workflow ? {
        id: workflow.id,
        name: workflow.name,
        type: workflow.type,
      } : null,
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        limit: parseInt(validatedParams.limit),
        offset: parseInt(validatedParams.offset),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // If workflowId is provided, verify it exists
    if (validatedData.workflowId) {
      const workflow = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, validatedData.workflowId))
        .limit(1);
      
      if (workflow.length === 0) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }
    }

    // Create product
    const newProduct = await db
      .insert(products)
      .values({
        name: validatedData.name,
        tagline: validatedData.tagline,
        description: validatedData.description || null,
        url: validatedData.url,
        productHuntUrl: validatedData.productHuntUrl || null,
        thumbnailUrl: validatedData.thumbnailUrl || null,
        votesCount: validatedData.votesCount,
        commentsCount: validatedData.commentsCount || null,
        categories: validatedData.categories,
        tags: validatedData.tags,
        featuredAt: validatedData.featuredAt ? new Date(validatedData.featuredAt) : null,
        launchedAt: validatedData.launchedAt ? new Date(validatedData.launchedAt) : null,
        workflowId: validatedData.workflowId || null,
        scrapedAt: validatedData.scrapedAt ? new Date(validatedData.scrapedAt) : new Date(),
      })
      .returning();

    return NextResponse.json({
      product: newProduct[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}