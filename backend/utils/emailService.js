const path = require('path');
const { google } = require('googleapis');

const sendEmailWithServiceAccount = async (to, subject, message) => {
  try {
    console.log(`Starting email sending process for: ${to}`);
    const serviceAccountPath = path.join(__dirname, 'serv_acc_creds.json');

    // Create auth client with the right scopes
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://mail.google.com/'  // Add this additional scope
      ]
    });
    
    const authClient = await auth.getClient();
    
    // Make sure info@kwslovenia.si is a Google Workspace account
    authClient.subject = 'info@kwslovenia.si';
    
    const gmail = google.gmail({ version: 'v1', auth: authClient });
    
    // Create email content with proper headers
    const emailLines = [
      `From: KW Slovenia <info@kwslovenia.si>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      message
    ];
    
    console.log(`Preparing email to: ${to}`);
    
    const email = emailLines.join('\r\n');
    const encodedEmail = Buffer.from(email).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Send email
    const response = await gmail.users.messages.send({
      userId: 'info@kwslovenia.si',  // Use the actual email instead of 'me'
      requestBody: {
        raw: encodedEmail
      }
    });
    
    console.log(`Email sent to ${to} with messageId: ${response.data.id}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', JSON.stringify(error.response?.data || error.message || error, null, 2));
    return false;
  }
};

module.exports = sendEmailWithServiceAccount;