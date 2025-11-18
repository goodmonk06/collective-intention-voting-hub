/**
 * Notification adapter interface and implementations
 */

import { logger } from '../logger';

export interface NotificationMessage {
  to: string | string[]; // Email addresses, phone numbers, or user IDs
  subject?: string;
  body: string;
  templateId?: string;
  data?: Record<string, any>;
}

export interface NotificationAdapter {
  send(message: NotificationMessage): Promise<void>;
  sendBatch(messages: NotificationMessage[]): Promise<void>;
}

/**
 * Console notification adapter (for development)
 */
export class ConsoleNotificationAdapter implements NotificationAdapter {
  async send(message: NotificationMessage): Promise<void> {
    console.log('\n📧 [NOTIFICATION]');
    console.log(`To: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
    if (message.subject) {
      console.log(`Subject: ${message.subject}`);
    }
    console.log(`Body: ${message.body}`);
    if (message.data) {
      console.log(`Data: ${JSON.stringify(message.data, null, 2)}`);
    }
    console.log('');
  }

  async sendBatch(messages: NotificationMessage[]): Promise<void> {
    for (const message of messages) {
      await this.send(message);
    }
  }
}

/**
 * Email notification adapter (stub for production)
 */
export class EmailNotificationAdapter implements NotificationAdapter {
  constructor(private config: {
    apiKey?: string;
    from: string;
    provider: 'sendgrid' | 'ses' | 'postmark';
  }) {}

  async send(message: NotificationMessage): Promise<void> {
    // In production, integrate with actual email service
    logger.info('Sending email notification', {
      to: message.to,
      subject: message.subject,
      provider: this.config.provider,
    });

    // TODO: Implement actual email sending
    // Example with SendGrid:
    // await sgMail.send({
    //   to: message.to,
    //   from: this.config.from,
    //   subject: message.subject,
    //   text: message.body,
    // });
  }

  async sendBatch(messages: NotificationMessage[]): Promise<void> {
    logger.info('Sending batch email notifications', {
      count: messages.length,
      provider: this.config.provider,
    });

    // TODO: Implement batch sending for better performance
    for (const message of messages) {
      await this.send(message);
    }
  }
}

/**
 * SMS notification adapter (stub)
 */
export class SMSNotificationAdapter implements NotificationAdapter {
  constructor(private config: {
    apiKey?: string;
    from: string;
    provider: 'twilio' | 'vonage';
  }) {}

  async send(message: NotificationMessage): Promise<void> {
    logger.info('Sending SMS notification', {
      to: message.to,
      provider: this.config.provider,
    });

    // TODO: Implement actual SMS sending
  }

  async sendBatch(messages: NotificationMessage[]): Promise<void> {
    for (const message of messages) {
      await this.send(message);
    }
  }
}

/**
 * Multi-channel notification adapter
 */
export class MultiChannelNotificationAdapter implements NotificationAdapter {
  constructor(
    private adapters: {
      email?: EmailNotificationAdapter;
      sms?: SMSNotificationAdapter;
      push?: NotificationAdapter;
    }
  ) {}

  async send(message: NotificationMessage & { channels?: string[] }): Promise<void> {
    const channels = message.channels || ['email'];
    const promises: Promise<void>[] = [];

    if (channels.includes('email') && this.adapters.email) {
      promises.push(this.adapters.email.send(message));
    }

    if (channels.includes('sms') && this.adapters.sms) {
      promises.push(this.adapters.sms.send(message));
    }

    if (channels.includes('push') && this.adapters.push) {
      promises.push(this.adapters.push.send(message));
    }

    await Promise.all(promises);
  }

  async sendBatch(messages: NotificationMessage[]): Promise<void> {
    await Promise.all(messages.map((msg) => this.send(msg)));
  }
}

// Global notification adapter (defaults to console in development)
let notificationAdapter: NotificationAdapter = new ConsoleNotificationAdapter();

export function setNotificationAdapter(adapter: NotificationAdapter): void {
  notificationAdapter = adapter;
}

export function getNotificationAdapter(): NotificationAdapter {
  return notificationAdapter;
}
