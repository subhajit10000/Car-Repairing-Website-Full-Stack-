
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const sendEmail = async (to, subject, text, html = null) => {
    try {
        // Validate required inputs
        if (!to || !subject || !text) {
            throw new Error(
                "Recipient, subject, and text body are required."
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: `"Car Detailing" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            ...(html && { html }),
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email sent successfully: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error(`❌ Failed to send email: ${error.message}`);

        // Important:
        // Re-throw the error so the OTP/auth service
        // knows that the email was not sent.
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

export default sendEmail;

