// test-email.js
// Simple script to test the email service

require('dotenv').config();
const nodemailer = require('nodemailer');

// Use Gmail with app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test if settings work
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email service connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Error verifying email connection:', error);

    // Provide more helpful error messages for common issues
    if (error.code === 'EAUTH') {
      console.error('\n👉 Authentication failed. Please check:');
      console.error('  - Your EMAIL_USER and EMAIL_PASSWORD environment variables');
      console.error('  - Make sure you\'re using an App Password, not your regular Gmail password');
      console.error('  - Create an App Password at: https://myaccount.google.com/apppasswords\n');
    } else if (error.code === 'ESOCKET') {
      console.error('\n👉 Connection issue. Please check:');
      console.error('  - Your internet connection');
      console.error('  - Any firewalls or network restrictions\n');
    }

    return false;
  }
}

// Send a test email
async function sendTestEmail() {
  if (!(await verifyConnection())) {
    return;
  }

  // Check for required environment variables
  if (!process.env.EMAIL_USER) {
    console.error('❌ Missing EMAIL_USER in .env file');
    return;
  }

  // Get the test recipient email
  const testEmailRecipient = process.argv[2] || process.env.EMAIL_USER;

  try {
    // Define the email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmailRecipient,
      subject: '✅ Test Email from Catálogo Jugos UY',
      html: `
        <h1 style="color: #4a7eb0;">Email Service Test</h1>
        <p>This is a test email from your <strong>Catálogo Jugos UY</strong> application.</p>
        <p>If you received this email, your email service is configured correctly! 🎉</p>

        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4a7eb0;">
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>From: ${process.env.EMAIL_USER}</li>
            <li>To: ${testEmailRecipient}</li>
            <li>Sent at: ${new Date().toLocaleString()}</li>
          </ul>
        </div>

        <p>You can now use the email service to send order notifications to customers.</p>
        <p>This is an automated test message.</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Sent to:', testEmailRecipient);
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

// Run the test
sendTestEmail().catch(console.error);

console.log('\n📝 Usage:');
console.log('  node test-email.js [recipient-email]');
console.log('  If no recipient is provided, it will send to EMAIL_USER\n');
