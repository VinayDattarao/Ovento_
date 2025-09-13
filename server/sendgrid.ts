// PROTOTYPE MODE: All SendGrid API calls replaced with hardcoded responses
// No external API dependencies - everything runs standalone

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  console.log("📧 PROTOTYPE: Simulating email send (SendGrid not used)");
  console.log(`📨 TO: ${params.to}`);
  console.log(`📤 FROM: ${params.from}`);
  console.log(`📝 SUBJECT: ${params.subject}`);
  
  if (params.text) {
    console.log(`📄 TEXT CONTENT: ${params.text.substring(0, 100)}...`);
  }
  
  if (params.html) {
    console.log(`🌐 HTML CONTENT: ${params.html.length} characters`);
  }
  
  if (params.templateId) {
    console.log(`📋 TEMPLATE ID: ${params.templateId}`);
    console.log(`🔧 TEMPLATE DATA: ${JSON.stringify(params.dynamicTemplateData)}`);
  }
  
  // Simulate successful delivery
  console.log(`✅ Email successfully delivered to ${params.to} (simulated)`);
  return true;
}

export async function sendEventRegistrationEmail(
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string
): Promise<boolean> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4f46e5, #ec4899); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Event Registration Confirmed</h1>
      </div>
      <div style="padding: 20px; background-color: #1a1a1a; color: #f5f5f5;">
        <h2>Hello ${userName}!</h2>
        <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p>We're excited to have you join us! You'll receive more details about the event closer to the date.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://ovento.dev'}" 
             style="background: linear-gradient(135deg, #4f46e5, #ec4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            View Event Details
          </a>
        </div>
        <p>Best regards,<br>The Ovento Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || 'noreply@ovento.dev',
    subject: `Registration Confirmed: ${eventTitle}`,
    html: htmlContent,
  });
}

export async function sendTeamInviteEmail(
  inviteeEmail: string,
  inviteeName: string,
  teamName: string,
  inviterName: string,
  eventTitle: string
): Promise<boolean> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4f46e5, #ec4899); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Team Invitation</h1>
      </div>
      <div style="padding: 20px; background-color: #1a1a1a; color: #f5f5f5;">
        <h2>Hello ${inviteeName}!</h2>
        <p><strong>${inviterName}</strong> has invited you to join team <strong>${teamName}</strong> for the event <strong>${eventTitle}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://ovento.dev'}/teams" 
             style="background: linear-gradient(135deg, #4f46e5, #ec4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 10px;">
            Accept Invitation
          </a>
          <a href="${process.env.FRONTEND_URL || 'https://ovento.dev'}/teams" 
             style="border: 2px solid #4f46e5; color: #4f46e5; padding: 10px 22px; text-decoration: none; border-radius: 8px; display: inline-block;">
            View Details
          </a>
        </div>
        <p>Best regards,<br>The Ovento Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: inviteeEmail,
    from: process.env.FROM_EMAIL || 'noreply@ovento.dev',
    subject: `Team Invitation: ${teamName}`,
    html: htmlContent,
  });
}

export async function sendEventReminderEmail(
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  hoursUntilEvent: number
): Promise<boolean> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4f46e5, #ec4899); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Event Reminder</h1>
      </div>
      <div style="padding: 20px; background-color: #1a1a1a; color: #f5f5f5;">
        <h2>Hello ${userName}!</h2>
        <p>This is a friendly reminder that <strong>${eventTitle}</strong> starts in <strong>${hoursUntilEvent} hours</strong>.</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p>Make sure you have everything ready for the event. See you there!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://ovento.dev'}" 
             style="background: linear-gradient(135deg, #4f46e5, #ec4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Join Event
          </a>
        </div>
        <p>Best regards,<br>The Ovento Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || 'noreply@ovento.dev',
    subject: `Reminder: ${eventTitle} starts in ${hoursUntilEvent} hours`,
    html: htmlContent,
  });
}
