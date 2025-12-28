// backend/src/scripts/test-email.ts
import { sendWelcomeEmail } from '../lib/emails';
import { logger } from '../lib/logger';

async function testEmail() {
  console.log('Sending test email...');

  try {
    const result = await sendWelcomeEmail({
      user: {
        nick: 'TestUser',
        email: 'baykov-1988@mail.ru', // Замените на реальный email
      },
    });

    if (result.ok) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.log('❌ Failed to send test email');
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

testEmail();
