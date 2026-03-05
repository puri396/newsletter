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

export interface NewsletterEmailTemplateProps {
  newsletter: {
    subject: string;
    description?: string | null;
    body: string;
    bannerImageUrl?: string | null;
  };
  subscriber: {
    email: string;
    name?: string | null;
  };
  unsubscribeUrl: string;
  /** Optional: brand name and logo URL for header */
  brand?: { name?: string; logoUrl?: string };
  /** Optional: future open-tracking pixel URL; not implemented in Day 9 */
  trackingPixelUrl?: string;
}

const defaultBrand = { name: "Newsletter", logoUrl: undefined };

export function NewsletterEmailTemplate({
  newsletter,
  subscriber,
  unsubscribeUrl,
  brand = defaultBrand,
  trackingPixelUrl,
}: NewsletterEmailTemplateProps) {
  const brandName = brand?.name ?? defaultBrand.name;
  const logoUrl = brand?.logoUrl;

  return (
    <Html>
      <Head />
      <Preview>{newsletter.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header: logo + brand */}
          <Section style={header}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                width="120"
                height="40"
                style={logo}
              />
            ) : (
              <Text style={brandText}>{brandName}</Text>
            )}
          </Section>

          {/* Body: optional banner, title, description, main content */}
          <Section style={bodySection}>
            {newsletter.bannerImageUrl ? (
              <Img
                src={newsletter.bannerImageUrl}
                alt=""
                width={600}
                style={bannerImage}
              />
            ) : null}
            <Text style={title}>{newsletter.subject}</Text>
            {newsletter.description ? (
              <Text style={description}>{newsletter.description}</Text>
            ) : null}
            <Hr style={hr} />
            {/* TODO: sanitize newsletter.body if user-generated (e.g. DOMPurify or allowlist) */}
            <div
              style={contentWrap}
              dangerouslySetInnerHTML={{ __html: newsletter.body }}
            />
          </Section>

          {/* Footer: unsubscribe, company, copyright */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you subscribed to {brandName}.
            </Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe
            </Link>
            <Text style={footerText}>
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </Text>
            {trackingPixelUrl ? (
              <img
                src={trackingPixelUrl}
                width="1"
                height="1"
                alt=""
                style={{ display: "none" }}
              />
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#0f0f0f",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "600px",
  padding: "24px 16px",
};

const header: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  borderRadius: "8px 8px 0 0",
  padding: "20px 24px",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  display: "inline-block",
  maxHeight: "40px",
  width: "auto",
};

const brandText: React.CSSProperties = {
  color: "#e5e5e5",
  fontSize: "20px",
  fontWeight: 600,
  margin: 0,
};

const bodySection: React.CSSProperties = {
  backgroundColor: "#171717",
  padding: "24px",
};

const bannerImage: React.CSSProperties = {
  display: "block",
  maxWidth: "100%",
  width: "100%",
  height: "auto",
  marginBottom: "16px",
  borderRadius: "6px",
};

const title: React.CSSProperties = {
  color: "#fafafa",
  fontSize: "22px",
  fontWeight: 600,
  margin: "0 0 12px 0",
};

const description: React.CSSProperties = {
  color: "#a3a3a3",
  fontSize: "15px",
  lineHeight: 1.5,
  margin: "0 0 16px 0",
};

const hr: React.CSSProperties = {
  borderColor: "#262626",
  margin: "20px 0",
};

const contentWrap: React.CSSProperties = {
  color: "#d4d4d4",
  fontSize: "15px",
  lineHeight: 1.6,
};

const footer: React.CSSProperties = {
  padding: "20px 24px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#737373",
  fontSize: "12px",
  margin: "0 0 8px 0",
};

const unsubscribeLink: React.CSSProperties = {
  color: "#a78bfa",
  fontSize: "12px",
  marginBottom: "8px",
  display: "inline-block",
};

export default NewsletterEmailTemplate;
