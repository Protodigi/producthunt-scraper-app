import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: any;
  app_metadata?: any;
}

export interface AuthResult {
  user: AuthUser | null;
  isAdmin: boolean;
  error?: string;
}

/**
 * Check if the current user is authenticated and has admin privileges
 */
export async function checkAdminAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return {
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      };
    }

    // Check if user has admin role
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.app_metadata?.role === 'admin' ||
                    user.email === process.env.ADMIN_EMAIL;

    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      },
      isAdmin
    };
  } catch (error) {
    console.error('Error checking admin auth:', error);
    return {
      user: null,
      isAdmin: false,
      error: 'Authentication error'
    };
  }
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden: Admin access required') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Create a bad request response
 */
export function badRequestResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * Create a not found response
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  );
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}