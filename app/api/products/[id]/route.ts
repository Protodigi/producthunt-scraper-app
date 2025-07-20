import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, workflows } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for PUT request body
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  overview: z.string().optional(),
  productHuntUrl: z.string().url().optional(),
  workflowId: z.number().nullable().optional(),
  scrapedAt: z.string().datetime().optional(),
});

// Helper function to validate product ID
function validateProductId(id: string): number | null {
  const parsed = parseInt(id);
  return isNaN(parsed) ? null : parsed;
}

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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate product ID
    const productId = validateProductId(params.id);
    if (!productId) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Fetch product with workflow
    const result = await db
      .select({
        product: products,
        workflow: workflows,
      })
      .from(products)
      .leftJoin(workflows, eq(products.workflowId, workflows.id))
      .where(eq(products.id, productId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const { product, workflow } = result[0];

    // Format response
    const formattedProduct = {
      id: product.id,
      name: product.name,
      overview: product.overview,
      productHuntUrl: product.productHuntUrl,
      scrapedAt: product.scrapedAt,
      createdAt: product.createdAt,
      workflow: workflow ? {
        id: workflow.id,
        name: workflow.name,
        type: workflow.type,
      } : null,
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate product ID
    const productId = validateProductId(params.id);
    if (!productId) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If workflowId is provided, verify it exists
    if (validatedData.workflowId !== undefined && validatedData.workflowId !== null) {
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

    // Prepare update data
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.overview !== undefined) updateData.overview = validatedData.overview;
    if (validatedData.productHuntUrl !== undefined) updateData.productHuntUrl = validatedData.productHuntUrl;
    if (validatedData.workflowId !== undefined) updateData.workflowId = validatedData.workflowId;
    if (validatedData.scrapedAt !== undefined) updateData.scrapedAt = new Date(validatedData.scrapedAt);

    // Update product
    const updatedProduct = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json({ product: updatedProduct[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate product ID
    const productId = validateProductId(params.id);
    if (!productId) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product
    await db
      .delete(products)
      .where(eq(products.id, productId));

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}