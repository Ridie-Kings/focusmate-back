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
        subject: '¡Bienvenido a SherpApp! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4a6cf7; margin-bottom: 10px;">¡Bienvenido a SherpApp, ${name}! 🚀</h1>
              <p style="font-size: 18px; color: #555;">¡Estamos emocionados de tenerte a bordo! 🌟</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; line-height: 1.6;">Comienza a organizar tus tareas y aumenta tu productividad hoy mismo. Con SherpApp, tendrás todo lo que necesitas para alcanzar tus objetivos. 📋✨</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #777; font-size: 14px;">Saludos cordiales,<br><strong>El Equipo de SherpApp</strong> 🐑</p>
              <p style="color: #777; font-size: 12px;">Una empresa de Thallein</p>
            </div>
          </div>
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
        subject: 'Código de Restablecimiento de Contraseña - SherpApp 🔐',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4a6cf7; margin-bottom: 10px;">Restablecimiento de Contraseña 🔑</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 16px; line-height: 1.6;">Has solicitado restablecer tu contraseña. Utiliza el siguiente código para continuar:</p>
              
              <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px; color: #4a6cf7;">
                ${resetCode}
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Este código expirará en 15 minutos. ⏱️</p>
              <p style="font-size: 16px; line-height: 1.6;">Si no solicitaste este restablecimiento de contraseña, por favor ignora este correo. 🚫</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #777; font-size: 14px;">Saludos cordiales,<br><strong>El Equipo de SherpApp</strong> 🐑</p>
              <p style="color: #777; font-size: 12px;">Una empresa de Thallein</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Password reset code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset code to ${email}: ${error.message}`);
      throw error;
    }
  }
} 