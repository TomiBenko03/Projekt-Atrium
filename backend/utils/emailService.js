const nodemailer = require('nodemailer');

const sendEmailNotification = async (senderEmail, senderName, receiverEmail, message) => {
    try {
        // Create a transporter using the sender's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: senderEmail, // Use the sender's email
                pass: 'your-app-password' // You'll need to generate an app password for each agent's email
            }
        });

        await transporter.sendMail({
            from: senderEmail, // Use the sender's email
            to: receiverEmail,
            subject: 'New Comment Notification',
            text: `Hello,\n\nYou have received a new comment from ${senderName}:\n\n"${message}"\n\nLog in to your account to view.\n\nBest regards,\nYour Kw Slovenia Team`
        });
        console.log(`📧 Email sent to ${receiverEmail}`);
    } catch (error) {
        console.error('❌ Email error:', error);
    }
};

module.exports = sendEmailNotification;