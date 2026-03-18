import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface WelcomeEmailTemplateProps {
  subscriber: {
    email: string;
    name?: string | null;
  };
  appUrl: string;
  brandName?: string;
}

const defaultBrandName = "GenContent AI";

export function WelcomeEmailTemplate({
  subscriber,
  appUrl,
  brandName = defaultBrandName,
}: WelcomeEmailTemplateProps) {
  const subject = `Welcome to ${brandName}`;
  const firstName =
    subscriber.name?.trim() ||
    subscriber.email.substring(0, subscriber.email.indexOf("@")) ||
    undefined;

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={bodySection}>
            <Text style={title}>{subject}</Text>
            <Text style={paragraph}>
              {firstName ? `Hi ${firstName},` : "Hi there,"}
            </Text>
            <Text style={paragraph}>
              Thanks for subscribing to {brandName}. You&apos;ll start receiving
              concise, AI-crafted newsletters with product updates, insights,
              and best practices directly in your inbox.
            </Text>
            <Text style={paragraph}>
              You can unsubscribe from any future newsletter email using the
              link at the bottom of that message.
            </Text>
            <Text style={paragraph}>
              When you&apos;re ready to explore more, you can always return to
              your dashboard here:
            </Text>
            <Text style={linkText}>{appUrl}</Text>
            <Text style={paragraph}>Welcome aboard,</Text>
            <Text style={signature}>{brandName} Team</Text>
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

const bodySection: React.CSSProperties = {
  backgroundColor: "#171717",
  padding: "24px",
  borderRadius: "12px",
};

const title: React.CSSProperties = {
  color: "#fafafa",
  fontSize: "22px",
  fontWeight: 600,
  margin: "0 0 16px 0",
};

const paragraph: React.CSSProperties = {
  color: "#d4d4d4",
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "0 0 14px 0",
};

const linkText: React.CSSProperties = {
  color: "#a78bfa",
  fontSize: "14px",
  margin: "0 0 18px 0",
  wordBreak: "break-all",
};

const signature: React.CSSProperties = {
  color: "#e5e5e5",
  fontSize: "15px",
  fontWeight: 500,
  margin: 0,
};

export default WelcomeEmailTemplate;

