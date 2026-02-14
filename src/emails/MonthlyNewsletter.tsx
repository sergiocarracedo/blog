import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface BlogPost {
  title: string;
  url: string;
  description: string;
  teaser: string;
  image?: string;
  date: string;
}

interface MonthlyNewsletterProps {
  month: string;
  year: string;
  summary: string;
  posts: BlogPost[];
  unsubscribeUrl: string;
  viewOnlineUrl: string;
}

export const MonthlyNewsletter = ({
  month,
  year,
  summary,
  posts,
  unsubscribeUrl,
  viewOnlineUrl,
}: MonthlyNewsletterProps) => (
  <Html>
    <Head />
    <Preview>
      {month} {year} - New posts from sergiocarracedo.es
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={h1}>📬 Monthly Digest</Heading>
          <Text style={subtitle}>
            {month} {year}
          </Text>
        </Section>

        {/* Introduction */}
        <Section style={content}>
          <Text style={greeting}>Hey there! 👋</Text>

          <Text style={paragraph}>{summary}</Text>

          <Hr style={divider} />
        </Section>

        {/* Blog Posts */}
        <Section style={content}>
          {posts.map((post, index) => (
            <Section key={index} style={postCard}>
              {post.image && (
                <Img src={post.image} alt={post.title} style={postImage} width="536" height="300" />
              )}

              <Heading style={postTitle}>{post.title}</Heading>

              <Text style={postDate}>{post.date}</Text>

              <Text style={postTeaser}>{post.teaser}</Text>

              <Section style={buttonContainer}>
                <Button style={button} href={post.url}>
                  Read more →
                </Button>
              </Section>

              {index < posts.length - 1 && <Hr style={postDivider} />}
            </Section>
          ))}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>Thanks for reading!</Text>

          <Text style={footerText}>
            <Link href={viewOnlineUrl} style={footerLink}>
              View in browser
            </Link>
            {' • '}
            <Link href={unsubscribeUrl} style={footerLink}>
              Unsubscribe
            </Link>
          </Text>

          <Text style={footerText}>sergiocarracedo.es • Monthly Newsletter</Text>

          <Text style={footerSmall}>
            You're receiving this because you subscribed to updates from{' '}
            <Link href="https://sergiocarracedo.es" style={footerLink}>
              sergiocarracedo.es
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default MonthlyNewsletter;

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
  padding: '32px 32px 16px',
  textAlign: 'center' as const,
  backgroundColor: '#90c6be',
  borderRadius: '12px 12px 0 0',
};

const h1 = {
  color: '#213b4a',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
  lineHeight: '1.2',
};

const subtitle = {
  color: '#213b4a',
  fontSize: '18px',
  fontWeight: '400',
  margin: '8px 0 0 0',
  opacity: 0.8,
};

const content = {
  padding: '0 32px',
};

const greeting = {
  fontSize: '20px',
  lineHeight: '1.4',
  color: '#213b4a',
  fontWeight: '600',
  margin: '32px 0 16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#404040',
  margin: '16px 0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const postCard = {
  margin: '24px 0',
};

const postImage = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '16px',
  objectFit: 'cover' as const,
};

const postTitle = {
  color: '#213b4a',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 8px 0',
};

const postDate = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 12px 0',
};

const postTeaser = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#404040',
  margin: '0 0 20px 0',
};

const buttonContainer = {
  margin: '20px 0',
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

const postDivider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  padding: '32px 32px 0',
  borderTop: '2px solid #213b4a',
  marginTop: '32px',
};

const footerText = {
  fontSize: '14px',
  color: '#404040',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const footerLink = {
  color: '#213b4a',
  textDecoration: 'underline',
};

const footerSmall = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
};
