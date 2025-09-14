require('dotenv').config({ path: '.env' });
const emailService = require('./services/emailService');

async function testEmail() {
  try {
    console.log('🔍 Testing email service configuration...');
    console.log(`📧 Using email: ${process.env.EMAIL_USER}`);

    const testEmail = 'xirced334@gmail.com';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`\n📤 Sending test email to: ${testEmail}`);
    console.log(`🔢 OTP: ${otp}`);

    console.log('✉️  Sending email...');
    const result = await emailService.sendOTPEmail(testEmail, otp);

    console.log('\n📨 Email send result:', result ? '✅ Success' : '❌ Failed');

    if (result && result.success) {
      console.log('\n✅ Email sent successfully!');
      console.log(`📩 Message ID: ${result.messageId || 'Not available'}`);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Failed to send email:', result?.error || 'Unknown error');
      console.error('Details:', result?.details || 'No details');
    }
  } catch (error) {
    console.error('❌ Error in test script:', error);
  }
}

testEmail();
