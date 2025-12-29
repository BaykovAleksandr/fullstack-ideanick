// backend/src/scripts/test-email.ts
import { sendWelcomeEmail } from '../lib/emails';
import { logger } from '../lib/logger';

async function testEmail() {
  console.log('🧪 === EMAIL TEST START ===');

  try {
    const result = await sendWelcomeEmail({
      user: {
        nick: 'TestUser',
        email: 'baykov-1988@mail.ru', // ← твой email для теста
      },
    });

    if (result.ok) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your inbox (and spam folder)');
    } else {
      console.log('❌ Failed to send test email');
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    // Детализация ошибки
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }

  console.log('🧪 === EMAIL TEST END ===');
}

testEmail();
