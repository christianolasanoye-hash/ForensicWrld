import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { newsletterSchema, validateFormData } from '@/lib/validation';
import { checkRateLimit, hashIP, securityHeaders } from '@/lib/security';
import { getClientIP } from '@/lib/security-server';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = await getClientIP();

    // Check rate limit: 3 signups per hour per IP
    const rateLimit = checkRateLimit(clientIP, 'newsletter', 3, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateFormData(newsletterSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', validation.data.email)
      .single();

    if (existing) {
      if (existing.is_active) {
        // Already subscribed - but don't reveal this for privacy
        return NextResponse.json(
          { success: true, message: 'Thank you for subscribing!' },
          { status: 200, headers: securityHeaders }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            unsubscribed_at: null,
            subscribed_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        return NextResponse.json(
          { success: true, message: 'Welcome back! You have been re-subscribed.' },
          { status: 200, headers: securityHeaders }
        );
      }
    }

    // Insert new subscriber
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: validation.data.email,
      name: validation.data.name || null,
      source: validation.data.source || 'website',
      is_verified: false,
      is_active: true,
    });

    if (error) {
      console.error('Newsletter insert error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500, headers: securityHeaders }
      );
    }

    // Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'newsletter_signup',
      event_category: 'conversion',
      event_label: validation.data.source || 'website',
      page_path: request.headers.get('referer') || '/',
      metadata: { ip_hash: hashIP(clientIP) },
    });

    return NextResponse.json(
      { success: true, message: 'Thank you for subscribing!' },
      { status: 201, headers: securityHeaders }
    );
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: securityHeaders }
    );
  }
}
