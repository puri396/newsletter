import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface BlogEmailTemplateProps {
  blog: {
    subject: string;
    description?: string | null;
    body: string;
    bannerImageUrl?: string | null;
    publishedAt?: string | null;
    authorName?: string | null;
  };
  subscriber: {
    email: string;
    name?: string | null;
  };
  unsubscribeUrl: string;
  brand?: { name?: string; logoUrl?: string };
}

const defaultBrand = { name: "GenContent AI", logoUrl: undefined };

export function BlogEmailTemplate({
  blog,
  subscriber: _subscriber,
  unsubscribeUrl,
  brand = defaultBrand,
}: BlogEmailTemplateProps) {
  const brandName = brand?.name ?? defaultBrand.name;
  const logoUrl = brand?.logoUrl;

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <Html>
      <Head>
        <style>{`
          h1 { color: #111827; font-size: 26px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.3; }
          h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 28px 0 10px 0; line-height: 1.4; }
          h3 { color: #374151; font-size: 17px; font-weight: 600; margin: 22px 0 8px 0; line-height: 1.4; }
          p  { color: #374151; font-size: 16px; line-height: 1.75; margin: 0 0 16px 0; }
          a  { color: #7c3aed; text-decoration: underline; }
          ul, ol { color: #374151; font-size: 16px; line-height: 1.75; margin: 0 0 16px 0; padding-left: 24px; }
          li { margin-bottom: 6px; }
          blockquote { border-left: 4px solid #7c3aed; margin: 20px 0; padding: 12px 20px; background: #f5f3ff; border-radius: 0 6px 6px 0; }
          blockquote p { color: #4b5563; font-style: italic; margin: 0; }
          code { background: #f3f4f6; color: #6d28d9; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace; }
          pre  { background: #1e1e2e; color: #e2e8f0; padding: 16px 20px; border-radius: 8px; overflow-x: auto; margin: 20px 0; }
          pre code { background: transparent; color: inherit; padding: 0; font-size: 13px; }
          strong { color: #111827; font-weight: 600; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 28px 0; }
          img { max-width: 100%; height: auto; border-radius: 8px; }
        `}</style>
      </Head>
      <Preview>{blog.subject} — {brandName}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Brand Header ── */}
          <Section style={headerSection}>
            {logoUrl ? (
              <Img
                src={logoUrl}
                alt={brandName}
                width="140"
                height="40"
                style={logoStyle}
              />
            ) : (
              <Text style={brandNameText}>{brandName}</Text>
            )}
          </Section>

          {/* ── Article Card ── */}
          <Section style={articleCard}>

            {/* Optional Banner */}
            {blog.bannerImageUrl ? (
              <Img
                src={blog.bannerImageUrl}
                alt=""
                width={560}
                style={bannerStyle}
              />
            ) : null}

            {/* Meta: date + author */}
            <Text style={metaText}>
              {formattedDate}
              {blog.authorName ? ` · By ${blog.authorName}` : ""}
            </Text>

            {/* Title */}
            <Text style={titleStyle}>{blog.subject}</Text>

            {/* Description / subtitle */}
            {blog.description ? (
              <Text style={subtitleStyle}>{blog.description}</Text>
            ) : null}

            <Hr style={dividerStyle} />

            {/* Body — rendered as HTML (converted from markdown) */}
            <div
              style={bodyWrap}
              dangerouslySetInnerHTML={{ __html: blog.body }}
            />
          </Section>

          {/* ── Footer ── */}
          <Section style={footerSection}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              You received this email because you subscribed to{" "}
              <strong>{brandName}</strong>.
            </Text>
            <Link href={unsubscribeUrl} style={unsubscribeLinkStyle}>
              Unsubscribe
            </Link>
            <Text style={copyrightText}>
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "620px",
  padding: "32px 16px 48px",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "12px 12px 0 0",
  padding: "20px 28px",
  textAlign: "center" as const,
  marginBottom: "0",
};

const logoStyle: React.CSSProperties = {
  display: "inline-block",
  maxHeight: "40px",
  width: "auto",
  objectFit: "contain" as const,
};

const brandNameText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: "0.04em",
  margin: 0,
  textTransform: "uppercase" as const,
};

const articleCard: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 12px 12px",
  padding: "32px 36px 40px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
};

const bannerStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: "100%",
  height: "auto",
  borderRadius: "8px",
  marginBottom: "24px",
};

const metaText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: 500,
  letterSpacing: "0.01em",
  margin: "0 0 12px 0",
  textTransform: "uppercase" as const,
};

const titleStyle: React.CSSProperties = {
  color: "#111827",
  fontSize: "28px",
  fontWeight: 800,
  lineHeight: 1.25,
  margin: "0 0 12px 0",
  letterSpacing: "-0.02em",
};

const subtitleStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "17px",
  lineHeight: 1.6,
  margin: "0 0 4px 0",
  fontStyle: "italic",
};

const dividerStyle: React.CSSProperties = {
  borderColor: "#f3f4f6",
  margin: "24px 0",
};

const bodyWrap: React.CSSProperties = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: 1.75,
};

const footerSection: React.CSSProperties = {
  padding: "0 8px",
  textAlign: "center" as const,
  marginTop: "32px",
};

const footerDivider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "0 0 20px 0",
};

const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  margin: "0 0 8px 0",
  lineHeight: 1.5,
};

const unsubscribeLinkStyle: React.CSSProperties = {
  color: "#7c3aed",
  fontSize: "13px",
  display: "inline-block",
  marginBottom: "8px",
};

const copyrightText: React.CSSProperties = {
  color: "#d1d5db",
  fontSize: "12px",
  margin: "4px 0 0 0",
};

export default BlogEmailTemplate;
