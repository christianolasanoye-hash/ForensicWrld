import { z } from 'zod';

// =====================================================
// COMMON VALIDATION SCHEMAS
// =====================================================

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .regex(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    'Please enter a valid phone number'
  )
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL is too long');

export const safeTextSchema = z
  .string()
  .max(1000, 'Text is too long')
  .transform((text) => text.trim());

export const safeTextRequiredSchema = z
  .string()
  .min(1, 'This field is required')
  .max(1000, 'Text is too long')
  .transform((text) => text.trim());

export const safeLongTextSchema = z
  .string()
  .max(5000, 'Text is too long')
  .transform((text) => text.trim());

// =====================================================
// INTAKE FORM SCHEMA
// =====================================================

export const intakeFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters')
    .transform((name) => name.trim()),
  email: emailSchema,
  phone: phoneSchema,
  service: z.enum(
    ['film', 'photography', 'social', 'mentorship', 'events', 'other'],
    { message: 'Please select a valid service' }
  ),
  budget_range: z
    .enum(['under_1k', '1k_5k', '5k_10k', '10k_plus', 'not_sure'])
    .optional(),
  timeline: z
    .enum(['asap', '1_month', '2_3_months', '3_plus_months', 'flexible'])
    .optional(),
  description: safeLongTextSchema.optional(),
  referral_source: safeTextSchema.optional(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

// =====================================================
// NEWSLETTER SCHEMA
// =====================================================

export const newsletterSchema = z.object({
  email: emailSchema,
  name: safeTextSchema.optional(),
  source: z.string().max(100).optional(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// =====================================================
// ADMIN CONTENT SCHEMAS
// =====================================================

export const siteContentSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(100, 'Key is too long')
    .regex(/^[a-z_]+$/, 'Key must be lowercase with underscores'),
  value: safeLongTextSchema,
  type: z.enum(['text', 'media', 'link', 'html']).default('text'),
});

export const eventSchema = z.object({
  title: safeTextRequiredSchema,
  description: safeLongTextSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format')
    .optional(),
  location: safeTextSchema.optional(),
  location_url: urlSchema.optional().or(z.literal('')),
  image_url: urlSchema.optional().or(z.literal('')),
  registration_url: urlSchema.optional().or(z.literal('')),
  is_upcoming: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const merchSchema = z.object({
  name: safeTextRequiredSchema,
  description: safeLongTextSchema.optional(),
  status: z.enum(['preview', 'coming_soon', 'available', 'sold_out']),
  image_url: urlSchema.optional().or(z.literal('')),
  price: z.number().min(0).max(99999).optional(),
  external_link: urlSchema.optional().or(z.literal('')),
});

export type MerchFormData = z.infer<typeof merchSchema>;

export const modelTeamSchema = z.object({
  name: safeTextRequiredSchema,
  bio: safeLongTextSchema.optional(),
  headshot_url: urlSchema.optional().or(z.literal('')),
  instagram_handle: z
    .string()
    .max(30)
    .regex(/^[a-zA-Z0-9._]*$/, 'Invalid Instagram handle')
    .optional(),
  specialties: z.array(safeTextSchema).max(10).optional(),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type ModelTeamFormData = z.infer<typeof modelTeamSchema>;

export const microInfluencerSchema = z.object({
  name: safeTextRequiredSchema,
  platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter', 'other']),
  handle: safeTextRequiredSchema,
  profile_url: urlSchema,
  follower_count: z.number().min(0).max(999999999).optional(),
  niche: z.array(safeTextSchema).max(10).optional(),
  location: safeTextSchema.optional(),
  is_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),
  notes: safeLongTextSchema.optional(),
});

export type MicroInfluencerFormData = z.infer<typeof microInfluencerSchema>;

export const socialLinkSchema = z.object({
  platform: safeTextRequiredSchema,
  url: urlSchema,
  display_name: safeTextSchema.optional(),
  page_location: z.enum(['header', 'footer', 'social_page', 'all']).optional(),
  is_active: z.boolean().default(true),
});

export type SocialLinkFormData = z.infer<typeof socialLinkSchema>;

export const galleryAssetSchema = z.object({
  category: z.enum(['film', 'photography', 'social', 'events', 'merch']),
  type: z.enum(['image', 'video']),
  url: urlSchema,
  thumbnail_url: urlSchema.optional().or(z.literal('')),
  caption: safeTextSchema.optional(),
  alt_text: safeTextSchema.optional(),
  is_featured: z.boolean().default(false),
});

export type GalleryAssetFormData = z.infer<typeof galleryAssetSchema>;

// =====================================================
// VALIDATION HELPER FUNCTIONS
// =====================================================

export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { success: false, errors };
}

/**
 * Sanitize a string to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
        '&': '&amp;',
      };
      return entities[char] || char;
    })
    .trim();
}

/**
 * Validate that a string doesn't contain SQL injection patterns
 */
export function isSafeFromSQLInjection(input: string): boolean {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}
