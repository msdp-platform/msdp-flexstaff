import { Notification } from '../models/Notification';

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type?: string,
    relatedId?: string
  ): Promise<Notification> {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
    });

    // TODO: Send push notification via Firebase
    // TODO: Send SMS via Twilio (optional)
    // TODO: Send email via SendGrid (optional)

    return notification;
  }

  static async notifyShiftApplication(
    employerId: string,
    workerName: string,
    shiftTitle: string,
    applicationId: string
  ): Promise<void> {
    await this.createNotification(
      employerId,
      'New Shift Application',
      `${workerName} has applied for your shift: ${shiftTitle}`,
      'shift_application',
      applicationId
    );
  }

  static async notifyApplicationAccepted(
    workerId: string,
    shiftTitle: string,
    shiftDate: string,
    assignmentId: string
  ): Promise<void> {
    await this.createNotification(
      workerId,
      'Application Accepted!',
      `Your application for ${shiftTitle} on ${shiftDate} has been accepted`,
      'application_accepted',
      assignmentId
    );
  }

  static async notifyApplicationRejected(
    workerId: string,
    shiftTitle: string
  ): Promise<void> {
    await this.createNotification(
      workerId,
      'Application Update',
      `Your application for ${shiftTitle} was not successful this time`,
      'application_rejected'
    );
  }

  static async notifyTimesheetSubmitted(
    employerId: string,
    workerName: string,
    timesheetId: string
  ): Promise<void> {
    await this.createNotification(
      employerId,
      'Timesheet Submitted',
      `${workerName} has submitted a timesheet for approval`,
      'timesheet_submitted',
      timesheetId
    );
  }

  static async notifyTimesheetApproved(
    workerId: string,
    amount: number,
    timesheetId: string
  ): Promise<void> {
    await this.createNotification(
      workerId,
      'Timesheet Approved',
      `Your timesheet has been approved. Payment of £${amount.toFixed(2)} will be processed`,
      'timesheet_approved',
      timesheetId
    );
  }

  static async notifyPaymentProcessed(
    workerId: string,
    amount: number,
    paymentId: string
  ): Promise<void> {
    await this.createNotification(
      workerId,
      'Payment Received',
      `You've received a payment of £${amount.toFixed(2)}`,
      'payment_received',
      paymentId
    );
  }

  static async notifyTeamInvitation(
    workerId: string,
    companyName: string,
    teamId: string
  ): Promise<void> {
    await this.createNotification(
      workerId,
      'Team Invitation',
      `${companyName} has added you to their team!`,
      'team_invitation',
      teamId
    );
  }

  static async notifyNewMessage(
    recipientId: string,
    senderName: string,
    messageId: string
  ): Promise<void> {
    await this.createNotification(
      recipientId,
      'New Message',
      `You have a new message from ${senderName}`,
      'new_message',
      messageId
    );
  }

  static async notifyShiftReminder(
    workerId: string,
    shiftTitle: string,
    shiftTime: string,
    assignmentId: string
  ): Promise<void> {
    await this.createNotification(
      workerId,
      'Shift Reminder',
      `Reminder: Your shift "${shiftTitle}" starts at ${shiftTime}`,
      'shift_reminder',
      assignmentId
    );
  }
}

export default NotificationService;
