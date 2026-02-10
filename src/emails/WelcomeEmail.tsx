import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  email: string;
  confirmUrl: string;
}

export const WelcomeEmail = ({
  email = 'reader@example.com',
  confirmUrl = 'https://sergiocarracedo.es/api/newsletter/confirm?token=xxx',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your subscription to sergiocarracedo.es newsletter</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>📧 Welcome!</Heading>
        </Section>

        <Section style={content}>
          <Text style={paragraph}>Hi there,</Text>

          <Text style={paragraph}>
            Thanks for subscribing to my newsletter! I'm excited to have you on board.
          </Text>

          <Text style={paragraph}>
            You'll receive monthly digests with summaries of new blog posts about web development,
            JavaScript, TypeScript, and more.
          </Text>

          <Text style={paragraph}>
            <strong>Please confirm your email address to activate your subscription:</strong>
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmUrl}>
              Confirm Subscription
            </Button>
          </Section>

          <Text style={smallText}>Or copy and paste this link into your browser:</Text>
          <Text style={linkText}>{confirmUrl}</Text>

          <Text style={paragraph}>
            If you didn't sign up for this newsletter, you can safely ignore this email.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>sergiocarracedo.es • Monthly Newsletter</Text>
          <Text style={footerText}>
            You're receiving this because you signed up at{' '}
            <Link href="https://sergiocarracedo.es" style={link}>
              sergiocarracedo.es
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f3f4f6',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '12px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 32px 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#213b4a',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
  lineHeight: '1.2',
};

const content = {
  padding: '0 32px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#404040',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#90c6be',
  color: '#213b4a',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
};

const smallText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0',
};

const linkText = {
  fontSize: '12px',
  color: '#3b82f6',
  wordBreak: 'break-all' as const,
  margin: '8px 0',
};

const footer = {
  padding: '32px 32px 0',
  borderTop: '1px solid #e5e7eb',
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '4px 0',
};

const link = {
  color: '#213b4a',
  textDecoration: 'underline',
};
