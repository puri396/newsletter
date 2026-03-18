import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ConfirmSubscriptionTemplateProps {
  confirmUrl: string;
  subscriberName?: string | null;
  appName?: string;
}

export function ConfirmSubscriptionTemplate({
  confirmUrl,
  subscriberName,
  appName = "GenContent AI",
}: ConfirmSubscriptionTemplateProps) {
  const greeting = subscriberName ? `Hi ${subscriberName}!` : "Hi there!";

  return (
    <Html>
      <Head />
      <Preview>Confirm your subscription to {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>{appName}</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Confirm your subscription</Heading>
            <Text style={paragraph}>{greeting}</Text>
            <Text style={paragraph}>
              You&apos;re one click away from receiving the latest newsletters and
              updates from <strong>{appName}</strong>. Click the button below to
              confirm your subscription.
            </Text>
            <Button style={button} href={confirmUrl}>
              Confirm subscription
            </Button>
            <Text style={hint}>This link expires in 48 hours.</Text>
            <Text style={footer}>
              If you didn&apos;t sign up, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#0f0f0f",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const header: React.CSSProperties = {
  padding: "20px 24px 16px",
  textAlign: "center",
};

const brand: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#a78bfa",
  margin: 0,
};

const content: React.CSSProperties = {
  backgroundColor: "#171717",
  borderRadius: "12px",
  padding: "32px 32px 24px",
  border: "1px solid #2a2a2a",
};

const h1: React.CSSProperties = {
  color: "#f5f5f5",
  fontSize: "22px",
  fontWeight: "600",
  lineHeight: "1.3",
  marginBottom: "16px",
  marginTop: 0,
};

const paragraph: React.CSSProperties = {
  color: "#a1a1aa",
  fontSize: "15px",
  lineHeight: "1.6",
  marginBottom: "16px",
};

const button: React.CSSProperties = {
  backgroundColor: "#22d3ee",
  borderRadius: "8px",
  color: "#030712",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "700",
  padding: "12px 24px",
  textDecoration: "none",
  marginBottom: "20px",
};

const hint: React.CSSProperties = {
  color: "#71717a",
  fontSize: "12px",
  marginBottom: "8px",
};

const footer: React.CSSProperties = {
  color: "#52525b",
  fontSize: "12px",
  lineHeight: "1.5",
  marginTop: "16px",
};
