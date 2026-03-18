import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailTemplateProps {
  resetUrl: string;
  appName?: string;
}

export function PasswordResetEmailTemplate({
  resetUrl,
  appName = "GenContent AI",
}: PasswordResetEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your {appName} password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>{appName}</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Reset your password</Heading>
            <Text style={paragraph}>
              We received a request to reset your password. Click the button
              below to choose a new password. This link expires in{" "}
              <strong>1 hour</strong>.
            </Text>
            <Button style={button} href={resetUrl}>
              Reset password
            </Button>
            <Text style={hint}>
              If the button doesn&apos;t work, copy and paste this URL into
              your browser:
            </Text>
            <Text style={link}>{resetUrl}</Text>
            <Hr style={hr} />
            <Text style={footer}>
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will not change.
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
  marginBottom: "24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#fff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  marginBottom: "20px",
};

const hint: React.CSSProperties = {
  color: "#71717a",
  fontSize: "12px",
  marginBottom: "8px",
};

const link: React.CSSProperties = {
  color: "#a78bfa",
  fontSize: "12px",
  wordBreak: "break-all",
  marginBottom: "20px",
};

const hr: React.CSSProperties = {
  borderColor: "#2a2a2a",
  margin: "20px 0",
};

const footer: React.CSSProperties = {
  color: "#52525b",
  fontSize: "12px",
  lineHeight: "1.5",
};
