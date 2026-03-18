/** Minimal newsletter payload for sending (no Prisma dependency in contract). */
export interface SendNewsletterNewsletter {
  id: string;
  subject: string;
  description?: string | null;
  body: string;
  bannerImageUrl?: string | null;
  logoUrl?: string | null;
  /** 'blog' | 'newsletter' | 'image' | 'video' — controls which email template is used. */
  contentType?: string | null;
  authorName?: string | null;
  publishedAt?: Date | string | null;
}

/** Minimal subscriber payload for sending. */
export interface SendNewsletterSubscriber {
  id: string;
  email: string;
  name?: string | null;
}

export interface SendNewsletterEmailParams {
  newsletter: SendNewsletterNewsletter;
  subscriber: SendNewsletterSubscriber;
}

export interface SendNewsletterEmailResult {
  success: true;
  messageId: string;
}

export interface SendNewsletterEmailError {
  success: false;
  error: string;
}

export type SendNewsletterEmailResponse =
  | SendNewsletterEmailResult
  | SendNewsletterEmailError;

/** Optional: provider abstraction for swapping Resend/SendGrid/etc. */
export interface EmailProvider {
  send(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ id: string }>;
}
