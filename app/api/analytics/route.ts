import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkRateLimit, hashIP, securityHeaders } from '@/lib/security';
import { getClientIP } from '@/lib/security-server';
import { z } from 'zod';

// Schema for page view tracking
const pageViewSchema = z.object({
  page_path: z.string().max(500),
  referrer: z.string().max(2000).optional(),
  session_id: z.string().max(100).optional(),
});

// Schema for event tracking
const eventSchema = z.object({
  event_type: z.enum(['click', 'video_play', 'video_complete', 'scroll', 'form_start', 'external_link']),
  event_category: z.string().max(100).optional(),
  event_label: z.string().max(200).optional(),
  event_value: z.number().int().min(0).max(999999).optional(),
  page_path: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  session_id: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = await getClientIP();

    // Check rate limit: 100 analytics events per minute per IP
    const rateLimit = checkRateLimit(clientIP, 'analytics', 100, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limited' },
        { status: 429, headers: securityHeaders }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    const supabase = await createServerSupabaseClient();
    const ipHash = hashIP(clientIP);

    if (type === 'pageview') {
      const validation = pageViewSchema.safeParse(data);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid data' },
          { status: 400, headers: securityHeaders }
        );
      }

      await supabase.from('page_views').insert({
        page_path: validation.data.page_path,
        referrer: validation.data.referrer,
        user_agent: request.headers.get('user-agent')?.substring(0, 500),
        ip_hash: ipHash,
        session_id: validation.data.session_id,
      });
    } else if (type === 'event') {
      const validation = eventSchema.safeParse(data);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid data' },
          { status: 400, headers: securityHeaders }
        );
      }

      await supabase.from('analytics_events').insert({
        event_type: validation.data.event_type,
        event_category: validation.data.event_category,
        event_label: validation.data.event_label,
        event_value: validation.data.event_value,
        page_path: validation.data.page_path,
        metadata: { ...validation.data.metadata, ip_hash: ipHash },
        session_id: validation.data.session_id,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400, headers: securityHeaders }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: securityHeaders }
    );
  } catch (error) {
    console.error('Analytics API error:', error);
    // Silently fail for analytics - don't break user experience
    return NextResponse.json(
      { success: false },
      { status: 200, headers: securityHeaders }
    );
  }
}
