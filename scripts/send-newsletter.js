import { Resend } from 'resend';
import { render } from '@react-email/components';
import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { generateNewsletter } from './generate-newsletter.ts';
import MonthlyNewsletter from '../src/emails/MonthlyNewsletter.tsx';

const SUBSCRIBERS_FILE = join(process.cwd(), 'subscribers', 'subscribers.json');
const LOG_FILE = `newsletter-${new Date().toISOString().split('T')[0]}.log`;

// Logging helper
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  appendFileSync(LOG_FILE, logMessage);
}

// Load confirmed subscribers
function loadConfirmedSubscribers() {
  try {
    const data = readFileSync(SUBSCRIBERS_FILE, 'utf-8');
    const subscribers = JSON.parse(data);
    return subscribers.filter((s) => s.confirmed === true);
  } catch (error) {
    log(`⚠️  Error loading subscribers: ${error.message}`);
    return [];
  }
}

// Mark post files as sent
function markPostsAsSent(postFilePaths) {
  for (const filePath of postFilePaths) {
    try {
      let content = readFileSync(filePath, 'utf-8');

      // Add newsletterSent: true to frontmatter
      if (content.includes('newsletterSent:')) {
        content = content.replace(/newsletterSent:\s*(false|true)/, 'newsletterSent: true');
      } else {
        // Add after the first --- block
        content = content.replace(/^---\n/, '---\nnewsletterSent: true\n');
      }

      writeFileSync(filePath, content, 'utf-8');
      log(`✅ Marked as sent: ${filePath}`);
    } catch (error) {
      log(`⚠️  Error marking post as sent (${filePath}): ${error.message}`);
    }
  }
}

// Main function
async function main() {
  log('🚀 Starting newsletter generation and sending process...');

  const daysBack = parseInt(process.env.DAYS_BACK || '30', 10);
  const testMode = process.env.TEST_MODE === 'true';

  if (testMode) {
    log('🧪 Running in TEST MODE - emails will not be sent');
  }

  // Generate newsletter content
  log(`\n📝 Generating newsletter content (looking back ${daysBack} days)...`);

  const result = await generateNewsletter(daysBack);

  if (!result) {
    log('📭 No new posts found. Exiting.');
    process.exit(0);
  }

  const { content, posts } = result;

  // Load subscribers
  log('\n📋 Loading confirmed subscribers...');
  const subscribers = loadConfirmedSubscribers();

  if (subscribers.length === 0) {
    log('⚠️  No confirmed subscribers found. Exiting.');
    process.exit(0);
  }

  log(`✅ Found ${subscribers.length} confirmed subscriber(s)`);

  // Initialize Resend
  if (!process.env.RESEND_API_KEY) {
    log('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL || 'newsletter@sergiocarracedo.es';
  const siteUrl = process.env.SITE_URL || 'https://sergiocarracedo.es';

  // Generate unsubscribe and view online URLs
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe`;
  const viewOnlineUrl = `${siteUrl}/newsletter/archive/${content.year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // Render email HTML
  log('\n📧 Rendering email template...');

  const emailHtml = await render(
    MonthlyNewsletter({
      ...content,
      unsubscribeUrl,
      viewOnlineUrl,
    })
  );

  if (testMode) {
    log('\n📄 Newsletter preview:');
    log(JSON.stringify(content, null, 2));
    log(`\n✅ Test mode complete. Email HTML rendered (${emailHtml.length} chars)`);
    process.exit(0);
  }

  // Send emails
  log('\n📤 Sending newsletter to subscribers...');

  let successCount = 0;
  let failCount = 0;

  // Send in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (subscriber) => {
        try {
          const { error } = await resend.emails.send({
            from: fromEmail,
            to: subscriber.email,
            subject: `${content.month} ${content.year} - New posts from sergiocarracedo.es`,
            html: emailHtml,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
            },
          });

          if (error) {
            log(`❌ Failed to send to ${subscriber.email}: ${error.message}`);
            failCount++;
          } else {
            log(`✅ Sent to ${subscriber.email}`);
            successCount++;
          }
        } catch (error) {
          log(`❌ Error sending to ${subscriber.email}: ${error.message}`);
          failCount++;
        }
      })
    );

    // Wait 1 second between batches
    if (i + batchSize < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  log(`\n📊 Sending complete:`);
  log(`   ✅ Success: ${successCount}`);
  log(`   ❌ Failed: ${failCount}`);

  // Mark posts as sent
  if (successCount > 0) {
    log('\n📝 Marking posts as sent in frontmatter...');
    markPostsAsSent(posts);
  }

  log('\n🎉 Newsletter process complete!');
}

// Run
main()
  .then(() => {
    log('✅ Process finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    log(`❌ Fatal error: ${error.message}`);
    log(error.stack);
    process.exit(1);
  });
