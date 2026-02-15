import { Resend } from 'resend';

export interface Env {
  RESEND_API_KEY: string;
  SITE_URL: string;
  FROM_EMAIL: string;
  ALLOWED_ORIGIN: string;
}

// Simple token generation using Web Crypto API
async function generateToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Hash token for storage (we don't store raw tokens)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// CORS headers
function corsHeaders(origin: string, allowedOrigin: string): HeadersInit {
  const isAllowed = origin === allowedOrigin || allowedOrigin === '*';
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// JSON response helper
function jsonResponse(data: object, status: number, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Handle subscription request
async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '';
  const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

  try {
    const { email } = await request.json<{ email: string }>();

    if (!email || !email.includes('@')) {
      return jsonResponse({ error: 'Valid email is required' }, 400, cors);
    }

    const resend = new Resend(env.RESEND_API_KEY);

    // Check if already subscribed
    const { data: contacts } = await resend.contacts.list({
      audienceId: undefined, // Uses default audience
    });

    const existingContact = contacts?.data?.find(
      (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (existingContact) {
      return jsonResponse(
        { message: 'You are already subscribed!' },
        200,
        cors
      );
    }

    // Generate confirmation token
    const token = await generateToken();
    const tokenHash = await hashToken(token);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store pending subscription in Resend contact with metadata
    // We'll use first_name field temporarily to store token data
    // This is a workaround since Cloudflare Workers don't have built-in KV in free tier
    const tokenData = JSON.stringify({ hash: tokenHash, exp: expiresAt });

    await resend.contacts.create({
      email,
      unsubscribed: true, // Mark as unsubscribed until confirmed
      audienceId: process.env.RESEND_AUDIENCE_ID || '',
      firstName: tokenData, // Store token temporarily
    });

    // Send confirmation email
    const confirmUrl = `${env.SITE_URL}/newsletter/confirm?token=${token}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: env.FROM_EMAIL,
      to: email,
      subject: 'Confirm your subscription to sergiocarracedo.es',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #90c6be; padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #213b4a; margin: 0; font-size: 24px;">Confirm your subscription</h1>
          </div>
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hey there!</p>
            <p>Thanks for subscribing to my newsletter. Please confirm your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background: #90c6be; color: #213b4a; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; box-shadow: #213b4a 0 4px 0 0;">
                Confirm Subscription
              </a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Sergio Carracedo<br>
              <a href="https://sergiocarracedo.es" style="color: #90c6be;">sergiocarracedo.es</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return jsonResponse(
      { message: 'Confirmation email sent! Please check your inbox.' },
      200,
      cors
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return jsonResponse(
      { error: 'Failed to process subscription. Please try again.' },
      500,
      cors
    );
  }
}

// Handle confirmation request
async function handleConfirm(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');

  if (!token || !email) {
    return Response.redirect(`${env.SITE_URL}/newsletter/subscribe?error=invalid`, 302);
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const tokenHash = await hashToken(token);

    // Find the contact
    const { data: contacts } = await resend.contacts.list({
      audienceId: undefined,
    });

    const contact = contacts?.data?.find(
      (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (!contact) {
      return Response.redirect(`${env.SITE_URL}/newsletter/subscribe?error=not_found`, 302);
    }

    // Verify token from firstName field
    try {
      const tokenData = JSON.parse(contact.firstName || '{}');
      
      if (tokenData.hash !== tokenHash) {
        return Response.redirect(`${env.SITE_URL}/newsletter/subscribe?error=invalid_token`, 302);
      }

      if (Date.now() > tokenData.exp) {
        return Response.redirect(`${env.SITE_URL}/newsletter/subscribe?error=expired`, 302);
      }
    } catch {
      return Response.redirect(`${env.SITE_URL}/newsletter/subscribe?error=invalid_token`, 302);
    }

    // Update contact: mark as subscribed and clear token
    await resend.contacts.update({
      id: contact.id,
      audienceId: '',
      unsubscribed: false,
      firstName: '', // Clear token data
    });

    // Send welcome email
    await resend.emails.send({
      from: env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to sergiocarracedo.es newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #90c6be; padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #213b4a; margin: 0; font-size: 24px;">Welcome!</h1>
          </div>
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hey there!</p>
            <p>Your subscription is now confirmed. You'll receive monthly digests with my latest blog posts about web development, software engineering, and tech.</p>
            <p>In the meantime, feel free to check out my latest posts:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://sergiocarracedo.es/blog" style="display: inline-block; background: #90c6be; color: #213b4a; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; box-shadow: #213b4a 0 4px 0 0;">
                Visit the Blog
              </a>
            </p>
            <p>Thanks for subscribing!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Sergio Carracedo<br>
              <a href="https://sergiocarracedo.es" style="color: #90c6be;">sergiocarracedo.es</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return Response.redirect(`${env.SITE_URL}/newsletter/subscribe?success=true`, 302);
  } catch (error) {
    console.error('Confirm error:', error);
    return Response.redirect(`${env.SITE_URL}/newsletter/subscribe?error=server`, 302);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Route requests
    if (url.pathname === '/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env);
    }

    if (url.pathname === '/confirm' && request.method === 'GET') {
      return handleConfirm(request, env);
    }

    // Health check
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok' }, 200, cors);
    }

    return jsonResponse({ error: 'Not found' }, 404, cors);
  },
};
