import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SUBSCRIBERS_FILE = join(process.cwd(), 'subscribers', 'subscribers.json');

// Ensure subscribers directory exists
const subscribersDir = join(process.cwd(), 'subscribers');
if (!existsSync(subscribersDir)) {
  mkdirSync(subscribersDir, { recursive: true });
}

// Load or initialize subscribers
function loadSubscribers() {
  if (!existsSync(SUBSCRIBERS_FILE)) {
    return [];
  }
  const data = readFileSync(SUBSCRIBERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save subscribers
function saveSubscribers(subscribers) {
  writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), 'utf-8');
}

// Main handler
const eventType = process.env.EVENT_TYPE;
const email = process.env.EMAIL;
const timestamp = parseInt(process.env.TIMESTAMP || '0', 10);

console.log(`📧 Handling event: ${eventType}`);
console.log(`📮 Email: ${email}`);

const subscribers = loadSubscribers();

if (eventType === 'newsletter-subscribe') {
  // Check if already subscribed
  const existing = subscribers.find((s) => s.email === email);

  if (existing) {
    if (existing.confirmed) {
      console.log('ℹ️  Email already subscribed and confirmed');
    } else {
      console.log('ℹ️  Email already subscribed but not confirmed, updating timestamp');
      existing.subscribeDate = new Date(timestamp).toISOString();
    }
  } else {
    // Add new subscriber (unconfirmed)
    subscribers.push({
      email,
      confirmed: false,
      subscribeDate: new Date(timestamp).toISOString(),
      confirmDate: null,
      source: 'website',
    });
    console.log('✅ New subscriber added (pending confirmation)');
  }

  saveSubscribers(subscribers);
} else if (eventType === 'newsletter-confirm') {
  // Find and confirm subscriber
  const subscriber = subscribers.find((s) => s.email === email);

  if (subscriber) {
    if (subscriber.confirmed) {
      console.log('ℹ️  Email already confirmed');
    } else {
      subscriber.confirmed = true;
      subscriber.confirmDate = new Date(timestamp).toISOString();
      console.log('✅ Subscriber confirmed!');
    }
    saveSubscribers(subscribers);
  } else {
    console.log('⚠️  Subscriber not found for confirmation');
  }
}

console.log(`📊 Total subscribers: ${subscribers.length}`);
console.log(`✅ Confirmed: ${subscribers.filter((s) => s.confirmed).length}`);
console.log(`⏳ Pending: ${subscribers.filter((s) => !s.confirmed).length}`);
