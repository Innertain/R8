import { db } from "../db";
import { alertRules, alertDeliveries, userNotificationSettings } from "@shared/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_area';
  value: any;
  threshold?: number;
}

export interface EmergencyEvent {
  id: string;
  type: 'weather' | 'wildfire' | 'earthquake' | 'disaster';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  state?: string;
  coordinates?: { lat: number; lng: number };
  timestamp: Date;
  sourceData: any;
}

export class AlertEngine {
  async processEvent(event: EmergencyEvent): Promise<void> {
    console.log(`Processing alert for event: ${event.title}`);
    
    // Get all active alert rules for this event type
    const rules = await db
      .select()
      .from(alertRules)
      .where(and(
        eq(alertRules.isActive, true),
        eq(alertRules.alertType, event.type)
      ));

    for (const rule of rules) {
      if (await this.evaluateRule(rule, event)) {
        await this.triggerAlert(rule, event);
      }
    }
  }

  private async evaluateRule(rule: any, event: EmergencyEvent): Promise<boolean> {
    try {
      const conditions = rule.conditions as AlertCondition[];
      
      // Check geographic filters
      if (rule.states && rule.states.length > 0) {
        if (!event.state || !rule.states.includes(event.state)) {
          return false;
        }
      }

      // Check cooldown period
      const cooldownStart = new Date(Date.now() - (rule.cooldownMinutes * 60 * 1000));
      const recentAlerts = await db
        .select()
        .from(alertDeliveries)
        .where(and(
          eq(alertDeliveries.alertRuleId, rule.id),
          gte(alertDeliveries.createdAt, cooldownStart)
        ));

      if (recentAlerts.length > 0) {
        console.log(`Rule ${rule.name} is in cooldown period`);
        return false;
      }

      // Check daily limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayAlerts = await db
        .select()
        .from(alertDeliveries)
        .where(and(
          eq(alertDeliveries.alertRuleId, rule.id),
          gte(alertDeliveries.createdAt, today),
          lt(alertDeliveries.createdAt, tomorrow)
        ));

      if (todayAlerts.length >= rule.maxAlertsPerDay) {
        console.log(`Rule ${rule.name} has reached daily limit`);
        return false;
      }

      // Evaluate conditions
      for (const condition of conditions) {
        if (!this.evaluateCondition(condition, event)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error evaluating rule:', error);
      return false;
    }
  }

  private evaluateCondition(condition: AlertCondition, event: EmergencyEvent): boolean {
    const { field, operator, value, threshold } = condition;
    
    // Get the field value from the event
    let fieldValue: any;
    if (field.includes('.')) {
      // Handle nested fields like 'sourceData.magnitude'
      const parts = field.split('.');
      fieldValue = parts.reduce((obj, key) => obj?.[key], event);
    } else {
      fieldValue = (event as any)[field];
    }

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'in_area':
        // For geographic area checking (would need more complex implementation)
        return true;
      default:
        return false;
    }
  }

  private async triggerAlert(rule: any, event: EmergencyEvent): Promise<void> {
    console.log(`Triggering alert for rule: ${rule.name}`);
    
    // Get user notification settings
    const userSettings = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, rule.userId));

    const settings = userSettings[0];
    
    // Generate alert message
    const alertTitle = `${event.type.toUpperCase()}: ${event.title}`;
    const alertMessage = this.generateAlertMessage(rule, event);

    // Send notifications via each enabled method
    for (const method of rule.notificationMethods) {
      if (this.isNotificationMethodEnabled(method, settings)) {
        await this.deliverAlert(rule, event, method, alertTitle, alertMessage, settings);
      }
    }
  }

  private generateAlertMessage(rule: any, event: EmergencyEvent): string {
    let message = `Alert: ${event.title}\n\n`;
    message += `Location: ${event.location}\n`;
    message += `Severity: ${event.severity.toUpperCase()}\n`;
    message += `Time: ${event.timestamp.toLocaleString()}\n\n`;
    message += `Description: ${event.description}\n\n`;
    message += `Rule: ${rule.name}\n`;
    message += `Generated by Disaster Watch Center`;
    
    return message;
  }

  private isNotificationMethodEnabled(method: string, settings: any): boolean {
    if (!settings) return method === 'email'; // Default to email if no settings
    
    switch (method) {
      case 'email':
        return settings.emailEnabled && !!settings.email;
      case 'sms':
        return settings.smsEnabled && !!settings.phoneNumber;
      case 'webhook':
        return settings.webhookEnabled;
      default:
        return false;
    }
  }

  private async deliverAlert(
    rule: any,
    event: EmergencyEvent,
    method: string,
    title: string,
    message: string,
    settings: any
  ): Promise<void> {
    try {
      // Create delivery record
      const delivery = await db
        .insert(alertDeliveries)
        .values({
          alertRuleId: rule.id,
          userId: rule.userId,
          title,
          message,
          severity: event.severity,
          alertType: event.type,
          sourceData: event.sourceData,
          location: event.location,
          coordinates: event.coordinates,
          deliveryMethod: method,
          deliveryStatus: 'pending',
        })
        .returning();

      const deliveryId = delivery[0].id;

      // Send notification based on method
      let success = false;
      let errorMessage = '';

      switch (method) {
        case 'email':
          success = await this.sendEmail(settings.email, title, message);
          break;
        case 'sms':
          success = await this.sendSMS(settings.phoneNumber, message);
          break;
        case 'webhook':
          success = await this.sendWebhook(rule.webhookUrl, {
            rule,
            event,
            title,
            message,
            timestamp: new Date().toISOString(),
          });
          break;
      }

      // Update delivery status
      await db
        .update(alertDeliveries)
        .set({
          deliveryStatus: success ? 'sent' : 'failed',
          deliveredAt: success ? new Date() : null,
          errorMessage: success ? null : errorMessage,
        })
        .where(eq(alertDeliveries.id, deliveryId));

      console.log(`Alert ${success ? 'sent' : 'failed'} via ${method} to user ${rule.userId}`);
    } catch (error) {
      console.error(`Failed to deliver alert via ${method}:`, error);
    }
  }

  private async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    // For now, log the email (would integrate with SendGrid in production)
    console.log(`EMAIL TO: ${email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`MESSAGE: ${message}`);
    return true;
  }

  private async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    // For now, log the SMS (would integrate with Twilio in production)
    console.log(`SMS TO: ${phoneNumber}`);
    console.log(`MESSAGE: ${message}`);
    return true;
  }

  private async sendWebhook(url: string, payload: any): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (error) {
      console.error('Webhook delivery failed:', error);
      return false;
    }
  }

  // Method to manually trigger alert evaluation for testing
  async testAlert(ruleId: string, testEvent: EmergencyEvent): Promise<boolean> {
    const rules = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.id, ruleId));

    if (rules.length === 0) {
      throw new Error('Alert rule not found');
    }

    const rule = rules[0];
    return await this.evaluateRule(rule, testEvent);
  }
}

export const alertEngine = new AlertEngine();