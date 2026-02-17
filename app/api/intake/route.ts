import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { intakeFormSchema, validateFormData } from '@/lib/validation';
import { checkRateLimit, hashIP, securityHeaders } from '@/lib/security';
import { getClientIP } from '@/lib/security-server';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = await getClientIP();

    // Check rate limit: 5 submissions per hour per IP
    const rateLimit = checkRateLimit(clientIP, 'intake', 5, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
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
    const validation = validateFormData(intakeFormSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400, headers: securityHeaders }
      );
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Insert intake with metadata
    const { data, error } = await supabase
      .from('intakes')
      .insert({
        ...validation.data,
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent')?.substring(0, 500) || null,
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Intake insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit form. Please try again.' },
        { status: 500, headers: securityHeaders }
      );
    }

    // Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'form_submit',
      event_category: 'intake',
      event_label: validation.data.service,
      page_path: '/intake',
      metadata: { ip_hash: hashIP(clientIP) },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your submission. We will be in touch soon!',
        id: data.id,
      },
      { status: 201, headers: securityHeaders }
    );
  } catch (error) {
    console.error('Intake API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: securityHeaders }
    );
  }
}
