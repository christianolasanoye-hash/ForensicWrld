import { createServerSupabaseClient } from './supabase-server';
import { redirect } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';

// =====================================================
// AUTH TYPES
// =====================================================

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}

// =====================================================
// SERVER-SIDE AUTH FUNCTIONS
// =====================================================

/**
 * Get the current user session on the server
 * Returns null if not authenticated
 */
export async function getServerSession(): Promise<{
  user: User;
  session: Session;
} | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return {
    user: session.user,
    session,
  };
}

/**
 * Get the current user on the server
 * Returns null if not authenticated
 */
export async function getServerUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication for a server component or action
 * Redirects to login if not authenticated
 */
export async function requireAuth(redirectTo: string = '/admin/login'): Promise<User> {
  const user = await getServerUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Check if user is an admin
 * You can customize this based on your admin logic
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();

  if (!user || !user.email) {
    return false;
  }

  // Check if user email is in admin list
  // In production, you'd check a database field or role
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) {
    console.warn('ADMIN_EMAILS environment variable is not set. Denying admin access.');
    return false;
  }

  const adminEmails = adminEmailsEnv.split(',').map(email => email.trim().toLowerCase());
  return adminEmails.includes(user.email.toLowerCase());
}

/**
 * Require admin access
 * Redirects to home if not admin
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth('/login');

  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv || !user.email) {
    redirect('/');
  }

  const adminEmails = adminEmailsEnv.split(',').map(email => email.trim().toLowerCase());
  if (!adminEmails.includes(user.email.toLowerCase())) {
    redirect('/');
  }

  return user;
}

// =====================================================
// AUTH ACTIONS (Server Actions)
// =====================================================

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}

/**
 * Sign up a new user (for initial admin setup)
 */
export async function signUp(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/**
 * Request password reset
 */
export async function resetPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/**
 * Update password (after reset)
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}
