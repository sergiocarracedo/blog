import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import WelcomeEmail from '../../../emails/WelcomeEmail';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if contact already exists in Resend
    const { data: existingContacts } = await resend.contacts.list();
    const contactExists = existingContacts?.data?.some(
      (contact) => contact.email === email
    );

    if (contactExists) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'You are already subscribed!',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Generate confirmation token
    const token = Buffer.from(
      JSON.stringify({
        email,
        timestamp: Date.now(),
      })
    ).toString('base64url');

    const confirmUrl = `${new URL(request.url).origin}/api/newsletter/confirm?token=${token}`;

    // Render email
    const emailHtml = await render(
      WelcomeEmail({
        email,
        confirmUrl,
      })
    );

    // Send welcome email via Resend
    const { error } = await resend.emails.send({
      from: import.meta.env.FROM_EMAIL || 'newsletter@sergiocarracedo.es',
      to: email,
      subject: 'Confirm your newsletter subscription',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send confirmation email' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Confirmation email sent',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
