import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface DiscordWebhookMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
  thumbnail?: { url: string };
}

@Injectable()
export class DiscordWebhookService {
  private readonly logger = new Logger(DiscordWebhookService.name);
  private readonly webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL');
    if (!this.webhookUrl) {
      this.logger.warn('Discord webhook URL not configured');
    }
  }

  private async sendWebhook(message: DiscordWebhookMessage): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn('Discord webhook URL not configured, skipping notification');
      return;
    }

    try {
      await axios.post(this.webhookUrl, message);
    } catch (error) {
      this.logger.error(`Failed to send Discord webhook: ${error.message}`);
    }
  }

  async notifyNewUser(username: string, email: string): Promise<void> {
    const embed: DiscordEmbed = {
      title: '👤 New User Registration',
      description: 'A new user has registered in the application',
      color: 0x00ff00, // Green color
      fields: [
        { name: 'Username', value: username, inline: true },
        { name: 'Email', value: email, inline: true }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SherpApp User Registration'
      }
    };

    await this.sendWebhook({ embeds: [embed] });
  }

  async notifyUserLogin(username: string): Promise<void> {
    const embed: DiscordEmbed = {
      title: '🔐 User Login',
      description: 'A user has logged into the application',
      color: 0x0099ff, // Blue color
      fields: [
        { name: 'Username', value: username }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SherpApp User Login'
      }
    };

    await this.sendWebhook({ embeds: [embed] });
  }

  async notifyNewTask(taskTitle: string, username: string, priority: string): Promise<void> {
    const embed: DiscordEmbed = {
      title: '📝 New Task Created',
      description: 'A new task has been created',
      color: 0xffa500, // Orange color
      fields: [
        { name: 'Task', value: taskTitle, inline: true },
        { name: 'Created By', value: username, inline: true },
        { name: 'Priority', value: priority, inline: true }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SherpApp Task Management'
      }
    };

    await this.sendWebhook({ embeds: [embed] });
  }

  async notifyTaskCompleted(taskTitle: string, username: string): Promise<void> {
    const embed: DiscordEmbed = {
      title: '✅ Task Completed',
      description: 'A task has been marked as complete',
      color: 0x00ff00, // Green color
      fields: [
        { name: 'Task', value: taskTitle, inline: true },
        { name: 'Completed By', value: username, inline: true }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SherpApp Task Management'
      }
    };

    await this.sendWebhook({ embeds: [embed] });
  }

  async notifyPomodoroCompleted(username: string, duration: number): Promise<void> {
    const embed: DiscordEmbed = {
      title: '⏰ Pomodoro Completed',
      description: 'A pomodoro session has been completed',
      color: 0xff0000, // Red color
      fields: [
        { name: 'User', value: username, inline: true },
        { name: 'Duration', value: `${Math.floor(duration / 60)} minutes`, inline: true }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SherpApp Pomodoro Timer'
      }
    };

    await this.sendWebhook({ embeds: [embed] });
  }
} 