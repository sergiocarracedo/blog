import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const GET: APIRoute = async ({ url, redirect }) => {
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Invalid confirmation link', { status: 400 });
  }

  try {
    // Decode token
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));

    const { email, timestamp } = decoded;

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Confirmation Link Expired</title>
            <style>
              body { font-family: sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
              h1 { color: #ef4444; }
              p { color: #404040; line-height: 1.6; }
              a { color: #213b4a; text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>⏰ Link Expired</h1>
            <p>This confirmation link has expired. Confirmation links are valid for 24 hours.</p>
            <p><a href="/">Go back to homepage</a></p>
          </body>
        </html>
      `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Add contact to Resend
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
    });

    if (error) {
      console.error('Error adding contact to Resend:', error);
      // Don't fail if contact already exists
      if (!error.message?.includes('already exists')) {
        throw error;
      }
    }

    // Return success page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subscription Confirmed!</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              max-width: 600px; 
              margin: 100px auto; 
              padding: 20px; 
              text-align: center;
              background: #f3f4f6;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 { color: #213b4a; margin-bottom: 16px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            p { color: #404040; line-height: 1.6; margin-bottom: 12px; }
            a { 
              display: inline-block;
              margin-top: 24px;
              padding: 12px 32px;
              background: #90c6be;
              color: #213b4a;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              transition: transform 0.2s;
            }
            a:hover { transform: translateY(-2px); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h1>You're all set!</h1>
            <p>Your subscription to the newsletter has been confirmed.</p>
            <p>You'll receive monthly digests with summaries of new blog posts.</p>
            <p><strong>Next newsletter:</strong> First of next month</p>
            <a href="/">Back to blog</a>
          </div>
        </body>
      </html>
    `,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Confirmation error:', error);
    return new Response('Invalid confirmation link', { status: 400 });
  }
};
