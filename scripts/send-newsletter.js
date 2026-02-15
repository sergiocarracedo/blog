import { render } from '@react-email/components';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { Resend } from 'resend';
import MonthlyNewsletter from '../src/emails/MonthlyNewsletter.tsx';
import { generateNewsletter } from './generate-newsletter.ts';

const LOG_FILE = `newsletter-${new Date().toISOString().split('T')[0]}.log`;

// Logging helper
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  appendFileSync(LOG_FILE, logMessage);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    testMode: false,
    dataFile: null,
  };

  for (const arg of args) {
    if (arg === '--test') {
      result.testMode = true;
    } else if (arg.startsWith('--data-file=')) {
      result.dataFile = arg.split('=')[1];
    }
  }

  return result;
}

// Load subscribers from Resend
async function loadSubscribers(resend) {
  try {
    log('📋 Fetching subscribers from Resend...');
    const { data } = await resend.contacts.list();

    if (!data?.data) {
      log('⚠️  No data returned from Resend');
      return [];
    }

    // Filter out unsubscribed contacts
    const activeSubscribers = data.data.filter((contact) => !contact.unsubscribed);

    log(`✅ Found ${activeSubscribers.length} active subscriber(s)`);
    return activeSubscribers;
  } catch (error) {
    log(`⚠️  Error loading subscribers from Resend: ${error.message}`);
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
  log('🚀 Starting newsletter sending process...');

  const { testMode, dataFile } = parseArgs();
  const daysBack = parseInt(process.env.DAYS_BACK || '30', 10);

  if (testMode) {
    log('🧪 Running in TEST MODE - email will be sent to hi@sergiocarracedo.es only');
  }

  let content;
  let posts = [];

  // Load newsletter content from file or generate it
  if (dataFile && existsSync(dataFile)) {
    log(`📂 Loading newsletter data from ${dataFile}...`);
    content = JSON.parse(readFileSync(dataFile, 'utf-8'));
  } else {
    // Generate newsletter content
    log(`\n📝 Generating newsletter content (looking back ${daysBack} days)...`);

    const result = await generateNewsletter(daysBack);

    if (!result) {
      log('📭 No new posts found. Exiting.');
      process.exit(0);
    }

    content = result.content;
    posts = result.posts;
  }

  // Initialize Resend
  if (!process.env.RESEND_API_KEY) {
    log('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Load subscribers from Resend
  let subscribers = await loadSubscribers(resend);

  // In test mode, override subscribers with test email
  if (testMode) {
    log('🧪 Overriding subscribers with test email: hi@sergiocarracedo.es');
    subscribers = [{ email: 'hi@sergiocarracedo.es' }];
  } else if (subscribers.length === 0) {
    log('⚠️  No subscribers found. Exiting.');
    process.exit(0);
  }
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

  // Send emails using batch API (up to 100 per request)
  log('\n📤 Sending newsletter to subscribers...');

  let successCount = 0;
  let failCount = 0;

  // Resend batch API supports up to 100 emails per request
  const batchSize = 100;

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    // Prepare batch of emails
    const emails = batch.map((subscriber) => ({
      from: fromEmail,
      to: subscriber.email,
      subject: `${content.month} ${content.year} - New posts from sergiocarracedo.es`,
      html: emailHtml,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
      },
    }));

    try {
      log(`📨 Sending batch of ${emails.length} email(s)...`);
      const { data, error } = await resend.batch.send(emails);

      if (error) {
        log(`❌ Batch send failed: ${error.message}`);
        failCount += emails.length;
      } else {
        // data.data contains array of results for each email
        const results = data?.data || [];
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          const email = batch[j]?.email;
          if (result.id) {
            log(`✅ Sent to ${email}`);
            successCount++;
          } else {
            log(`❌ Failed to send to ${email}`);
            failCount++;
          }
        }
      }
    } catch (error) {
      log(`❌ Batch error: ${error.message}`);
      failCount += emails.length;
    }

    // Small delay between batches if there are more
    if (i + batchSize < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  log(`\n📊 Sending complete:`);
  log(`   ✅ Success: ${successCount}`);
  log(`   ❌ Failed: ${failCount}`);

  // Mark posts as sent (skip in test mode and when using data file - already marked)
  if (successCount > 0 && !testMode && posts.length > 0) {
    log('\n📝 Marking posts as sent in frontmatter...');
    markPostsAsSent(posts);
  } else if (testMode) {
    log('\n⏭️  Skipping marking posts as sent (test mode)');
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
