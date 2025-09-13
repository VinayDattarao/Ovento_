// PROTOTYPE MODE: All SendGrid API calls replaced with hardcoded responses
// No external API dependencies - everything runs standalone

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(
  apiKey: string,
  params: EmailParams
): Promise<boolean> {
  console.log("📧 PROTOTYPE: Simulating email send via service (SendGrid not used)");
  console.log(`🔑 API KEY: ${apiKey ? '[PROVIDED]' : '[NOT PROVIDED]'}`);
  console.log(`📨 TO: ${params.to}`);
  console.log(`📤 FROM: ${params.from}`);
  console.log(`📝 SUBJECT: ${params.subject}`);
  
  if (params.text) {
    console.log(`📄 TEXT CONTENT: ${params.text.substring(0, 100)}...`);
  }
  
  if (params.html) {
    console.log(`🌐 HTML CONTENT: ${params.html.length} characters`);
  }
  
  // Simulate successful delivery
  console.log(`✅ Email successfully delivered to ${params.to} (simulated)`);
  return true;
}
