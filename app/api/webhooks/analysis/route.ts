import { NextRequest, NextResponse } from 'next/server';
import { db, analysisReports, workflows, products } from '../../../../src/lib/db';
import { validateAnalysisWebhook } from '../../../../src/lib/validations';
import { eq } from 'drizzle-orm';

// POST endpoint to receive analysis data from n8n
export async function POST(request: NextRequest) {
  try {
    // Log the webhook reception
    console.log('📥 Received analysis webhook from n8n');

    // Parse the request body
    const body = await request.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Validate the incoming data
    const validationResult = validateAnalysisWebhook(body);
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.format());
      return NextResponse.json(
        { 
          error: 'Invalid analysis data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const analysisData = validationResult.data;

    // Find the analysis workflow
    let workflowId: number | null = null;
    const analysisWorkflow = await db
      .select()
      .from(workflows)
      .where(eq(workflows.type, 'analysis'))
      .limit(1);
    
    if (analysisWorkflow.length > 0) {
      workflowId = analysisWorkflow[0].id;
      
      // Update workflow last executed timestamp
      await db
        .update(workflows)
        .set({ 
          lastExecuted: new Date(),
          updatedAt: new Date()
        })
        .where(eq(workflows.id, workflowId));
    }

    // Count the number of products analyzed (if product IDs are provided)
    let productsAnalyzed = 1; // Default to 1 if single product
    
    // If the analysis contains multiple products, update this count
    if (analysisData.metadata?.dataPoints) {
      productsAnalyzed = analysisData.metadata.dataPoints;
    }

    // Prepare analysis report data
    const analysisContent = {
      productId: analysisData.productId,
      analysisType: analysisData.analysisType,
      result: analysisData.analysisResult,
      metadata: analysisData.metadata,
      status: analysisData.status,
      error: analysisData.error,
    };

    // Create a title for the analysis report
    const title = generateAnalysisTitle(analysisData);

    // Insert the analysis report into the database
    const [insertedReport] = await db
      .insert(analysisReports)
      .values({
        title: title,
        content: JSON.stringify(analysisContent),
        productsAnalyzed: productsAnalyzed,
        workflowId: workflowId,
        analyzedAt: new Date(analysisData.createdAt),
      })
      .returning();

    console.log('✅ Analysis report saved successfully:', insertedReport.id);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Analysis data received and stored successfully',
        data: {
          reportId: insertedReport.id,
          reportTitle: insertedReport.title,
          analysisType: analysisData.analysisType,
          receivedAt: new Date().toISOString(),
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error processing analysis webhook:', error);
    
    // Check if it's a database error
    if (error instanceof Error) {
      // Log detailed error for debugging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to process analysis webhook',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  try {
    // Check database connection
    await db.select().from(workflows).limit(1);
    
    return NextResponse.json(
      { 
        status: 'healthy',
        endpoint: '/api/webhooks/analysis',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

// Helper function to generate analysis report title
function generateAnalysisTitle(analysisData: any): string {
  const typeLabels: Record<string, string> = {
    market_fit: 'Market Fit Analysis',
    competitor: 'Competitor Analysis',
    sentiment: 'Sentiment Analysis',
    feature: 'Feature Analysis',
    comprehensive: 'Comprehensive Analysis'
  };

  const analysisType = typeLabels[analysisData.analysisType] || 'Analysis';
  const date = new Date(analysisData.createdAt).toLocaleDateString();
  
  // Try to get product name if available
  if (analysisData.productName) {
    return `${analysisType} - ${analysisData.productName} (${date})`;
  }
  
  return `${analysisType} - Product ${analysisData.productId} (${date})`;
}