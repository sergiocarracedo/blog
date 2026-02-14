import {
  Body,
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
        {/* Header with profile picture */}
        <Section style={header}>
          <Img 
            src="https://sergiocarracedo.es/i/sergiocarracedo-alt-optimized.png" 
            alt="Sergio Carracedo" 
            width="80" 
            height="80" 
            style={profileImage}
          />
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
              <table style={postTable}>
                <tr>
                  {post.image && (
                    <td style={postImageCell}>
                      <Link href={post.url}>
                        <Img 
                          src={post.image} 
                          alt={post.title} 
                          style={postImage} 
                          width="300" 
                          height="150"
                        />
                      </Link>
                    </td>
                  )}
                  <td style={postContentCell}>
                    <Link href={post.url} style={postTitleLink}>
                      <Heading style={postTitle}>{post.title}</Heading>
                    </Link>
                    <Text style={postDate}>{post.date}</Text>
                    <Text style={postTeaser}>{post.teaser}</Text>
                    <Link href={post.url} style={readMoreLink}>
                      Read more →
                    </Link>
                  </td>
                </tr>
              </table>

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
  backgroundColor: '#f8f5ed',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'20\' height=\'20\' fill=\'%23f8f5ed\'/%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\' stroke=\'%23e8e1d4\' stroke-width=\'0.5\'/%3E%3C/svg%3E")',
  backgroundSize: '20px 20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '12px',
  maxWidth: '600px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const profileImage = {
  borderRadius: '50%',
  margin: '0 auto 16px',
  display: 'block',
  border: '3px solid #213b4a',
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

const postTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const postImageCell = {
  width: '300px',
  verticalAlign: 'top' as const,
  paddingRight: '16px',
};

const postContentCell = {
  verticalAlign: 'top' as const,
};

const postImage = {
  width: '300px',
  height: '150px',
  borderRadius: '8px',
  objectFit: 'cover' as const,
  display: 'block',
};

const postTitleLink = {
  textDecoration: 'none',
  color: '#213b4a',
};

const postTitle = {
  color: '#213b4a',
  fontSize: '20px',
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
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#404040',
  margin: '0 0 12px 0',
};

const readMoreLink = {
  color: '#90c6be',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '14px',
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
