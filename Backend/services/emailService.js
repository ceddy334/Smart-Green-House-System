const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.transporter.verify((error) => {
        if (error) {
          console.error('❌ Email server connection failed:', error);
        } else {
          console.log('✅ Email service is ready to send messages');
        }
      });
    } catch (error) {
      console.error('❌ Error initializing email service:', error);
      throw error;
    }
  }

  getTemplate(type, data) {
    switch (type) {
      case 'otp':
        return {
          subject: 'Email Verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
              <div style="background-color: #3498db; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h2 style="margin: 0;">📧 Email Verification</h2>
                <p style="margin: 5px 0 0;">Please verify your email address to complete registration</p>
              </div>
              <div style="padding: 20px; background-color: white;">
                <h3>Hello!</h3>
                <p>Thank you for registering with Smart Green House System. To complete your email verification, please use the following One-Time-Password (OTP):</p>
                <div style="border: 1px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0;">
                  <p style="font-size: 32px; letter-spacing: 5px; color: #2c3e50; margin: 0;">${data.otp}</p>
                  <p style="margin: 5px 0 0; color: #7f8c8d;">This code will expire in 10 minutes</p>
                </div>
                <div style="background-color: #fef9e7; border-left: 4px solid #f1c40f; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Security Notice:</p>
                  <ul style="margin: 10px 0 0; padding-left: 20px;">
                    <li>Never share this code with anyone.</li>
                    <li>Our team will never ask for this code.</li>
                    <li>If you didn't request this code, please ignore this email.</li>
                  </ul>
                </div>
                <p>If you have any questions, please contact our support team.</p>
              </div>
              <div style="text-align: center; padding: 20px; font-size: 12px; color: #7f8c8d;">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2025 Smart Green House System. All rights reserved.</p>
              </div>
            </div>
          `,
        };
      case 'password_reset':
        return {
          subject: 'Your Password Reset Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
              <div style="background-color: #8e44ad; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h2 style="margin: 0;">🔑 Password Reset</h2>
                <p style="margin: 5px 0 0;">Use the code below to reset your password</p>
              </div>
              <div style="padding: 20px; background-color: white;">
                <h3>Hello,</h3>
                <p>We received a request to reset the password for your account. Please use the following code to proceed:</p>
                <div style="border: 1px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0;">
                  <p style="font-size: 32px; letter-spacing: 5px; color: #2c3e50; margin: 0;">${data.resetCode}</p>
                  <p style="margin: 5px 0 0; color: #7f8c8d;">This code will expire in 15 minutes</p>
                </div>
                <div style="background-color: #fef9e7; border-left: 4px solid #f1c40f; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Security Notice:</p>
                  <ul style="margin: 10px 0 0; padding-left: 20px;">
                    <li>Never share this code with anyone.</li>
                    <li>Our team will never ask for this code.</li>
                    <li>If you didn't request a password reset, please ignore this email and contact support if you have concerns.</li>
                  </ul>
                </div>
                <p>If you have any questions, please contact our support team.</p>
              </div>
              <div style="text-align: center; padding: 20px; font-size: 12px; color: #7f8c8d;">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2025 Smart Green House System. All rights reserved.</p>
              </div>
            </div>
          `,
        };
      default:
        throw new Error('Invalid email template type');
    }
  }

  async sendEmail(to, type, data) {
    if (!to || !type || !data) {
      throw new Error('To, type, and data are required for sending an email');
    }

    try {
      if (!this.transporter) {
        this.initialize();
      }

      const { subject, html } = this.getTemplate(type, data);

      const mailOptions = {
        from: `"Smart Green House System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        details: error
      };
    }
  }
}

module.exports = new EmailService();