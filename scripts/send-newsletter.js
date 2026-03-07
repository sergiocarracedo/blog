import { render } from '@react-email/components';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
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

// Load subscribers from Resend, grouped by language preference
async function loadSubscribers(resend) {
  try {
    log('📋 Fetching subscribers from Resend...');
    const { data } = await resend.contacts.list();

    if (!data?.data) {
      log('⚠️  No data returned from Resend');
      return { en: [], es: [] };
    }

    // Filter out unsubscribed contacts
    const activeSubscribers = data.data.filter((contact) => !contact.unsubscribed);

    // Group by language preference (custom property). Default to 'en' if absent.
    const en = activeSubscribers.filter((c) => (c.properties?.lang ?? 'en') !== 'es');
    const es = activeSubscribers.filter((c) => c.properties?.lang === 'es');

    log(
      `✅ Found ${activeSubscribers.length} active subscriber(s): ${en.length} EN, ${es.length} ES`
    );
    return { en, es };
  } catch (error) {
    log(`⚠️  Error loading subscribers from Resend: ${error.message}`);
    return { en: [], es: [] };
  }
}

/**
 * Write a .newsletter.lock file to each post directory to mark the post as sent.
 * The lock file contains the send timestamp as JSON.
 * This replaces the old approach of mutating frontmatter in .mdx files.
 */
function markPostsAsSent(postPaths) {
  const sentAt = new Date().toISOString();
  for (const postPath of postPaths) {
    try {
      const lockPath = join(postPath, '.newsletter.lock');
      writeFileSync(lockPath, JSON.stringify({ sentAt }, null, 2) + '\n', 'utf-8');
      log(`✅ Lock file written: ${lockPath}`);
    } catch (error) {
      log(`⚠️  Error writing lock file (${postPath}): ${error.message}`);
    }
  }
}

/**
 * Send a batch of emails to a list of subscribers.
 * Returns { successCount, failCount }.
 */
async function sendBatch(resend, subscribers, emailHtml, subject, fromEmail, unsubscribeUrl) {
  let successCount = 0;
  let failCount = 0;
  const batchSize = 100;

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    const emails = batch.map((subscriber) => ({
      from: fromEmail,
      to: subscriber.email,
      subject,
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

  return { successCount, failCount };
}

// Main function
async function main() {
  log('🚀 Starting newsletter sending process...');

  const { testMode, dataFile } = parseArgs();
  const daysBack = parseInt(process.env.DAYS_BACK || '30', 10);

  if (testMode) {
    log('🧪 Running in TEST MODE - emails will be sent to hi@sergiocarracedo.es only');
  }

  let contentEn;
  let contentEs;
  let posts = [];

  // Load newsletter content from file or generate it
  if (dataFile && existsSync(dataFile)) {
    log(`📂 Loading newsletter data from ${dataFile}...`);
    const data = JSON.parse(readFileSync(dataFile, 'utf-8'));
    // Support both old single-content format and new bilingual format
    contentEn = data.contentEn ?? data;
    contentEs = data.contentEs ?? data;
  } else {
    log(`\n📝 Generating newsletter content (looking back ${daysBack} days)...`);

    const result = await generateNewsletter(daysBack);

    if (!result) {
      log('📭 No new posts found. Exiting.');
      process.exit(0);
    }

    contentEn = result.contentEn;
    contentEs = result.contentEs;
    posts = result.posts;
  }

  // Initialize Resend
  if (!process.env.RESEND_API_KEY) {
    log('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Load subscribers grouped by language
  let { en: enSubscribers, es: esSubscribers } = await loadSubscribers(resend);

  // In test mode, override subscribers with test email (receives EN version)
  if (testMode) {
    log('🧪 Overriding subscribers with test email: hi@sergiocarracedo.es');
    enSubscribers = [{ email: 'hi@sergiocarracedo.es' }];
    esSubscribers = [];
  } else if (enSubscribers.length === 0 && esSubscribers.length === 0) {
    log('⚠️  No subscribers found. Exiting.');
    process.exit(0);
  }

  const fromEmail = process.env.FROM_EMAIL || 'newsletter@sergiocarracedo.es';
  const siteUrl = process.env.SITE_URL || 'https://sergiocarracedo.es';

  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe`;
  const viewOnlineUrl = `${siteUrl}/newsletter/archive/${contentEn.year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  let totalSuccess = 0;
  let totalFail = 0;

  // ── EN subscribers ──────────────────────────────────────────────────────────
  if (enSubscribers.length > 0) {
    log(`\n📧 Rendering EN email template...`);
    const emailHtmlEn = await render(
      MonthlyNewsletter({
        ...contentEn,
        locale: 'en',
        unsubscribeUrl,
        viewOnlineUrl,
      })
    );

    const subjectEn = `${contentEn.month} ${contentEn.year} - New posts from sergiocarracedo.es`;
    log(`\n📤 Sending EN newsletter to ${enSubscribers.length} subscriber(s)...`);
    const { successCount, failCount } = await sendBatch(
      resend,
      enSubscribers,
      emailHtmlEn,
      subjectEn,
      fromEmail,
      unsubscribeUrl
    );
    totalSuccess += successCount;
    totalFail += failCount;
  }

  // ── ES subscribers ──────────────────────────────────────────────────────────
  if (esSubscribers.length > 0) {
    log(`\n📧 Rendering ES email template...`);
    const emailHtmlEs = await render(
      MonthlyNewsletter({
        ...contentEs,
        locale: 'es',
        unsubscribeUrl,
        viewOnlineUrl,
      })
    );

    const subjectEs = `${contentEs.month} ${contentEs.year} - Nuevas entradas en sergiocarracedo.es`;
    log(`\n📤 Sending ES newsletter to ${esSubscribers.length} subscriber(s)...`);
    const { successCount, failCount } = await sendBatch(
      resend,
      esSubscribers,
      emailHtmlEs,
      subjectEs,
      fromEmail,
      unsubscribeUrl
    );
    totalSuccess += successCount;
    totalFail += failCount;
  }

  log(`\n📊 Sending complete:`);
  log(`   ✅ Success: ${totalSuccess}`);
  log(`   ❌ Failed: ${totalFail}`);

  // Mark posts as sent by writing .newsletter.lock files
  if (totalSuccess > 0 && !testMode && posts.length > 0) {
    log('\n📝 Writing .newsletter.lock files...');
    markPostsAsSent(posts);
  } else if (testMode) {
    log('\n⏭️  Skipping lock files (test mode)');
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
