import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Welcome to SherpApp!',
        html: `
          <h1>Welcome to SherpApp, ${name}!</h1>
          <p>We're excited to have you on board. Start organizing your tasks and boost your productivity today!</p>
          <p>Best regards,<br>The SherpApp Team, a Thallein Company</p>
        `,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}: ${error.message}`);
    }
  }

  async sendPasswordResetCode(email: string, resetCode: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Password Reset Code - SherpApp',
        html: `
          <h1>Password Reset Request</h1>
          <p>You have requested to reset your password. Use the following code to proceed:</p>
          <h2 style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px;">${resetCode}</h2>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The SherpApp Team, a Thallein Company</p>
        `,
      });
      this.logger.log(`Password reset code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset code to ${email}: ${error.message}`);
      throw error;
    }
  }
} 