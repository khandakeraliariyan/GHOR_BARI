import nodemailer from "nodemailer";


// Email transporter instance (lazy loaded)
let transporter;


/**
 * Get or create email transporter using SMTP configuration
 * @returns {Object} Nodemailer transporter instance
 */
function getTransporter() {

    // Return existing transporter if already created
    if (transporter) {
        return transporter;
    }


    // Get SMTP configuration from environment
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS
    } = process.env;


    // Validate SMTP configuration
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error("SMTP configuration is incomplete");
    }


    // Create and store transporter
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    return transporter;

}


/**
 * Send email with given parameters
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML email body
 */
export async function sendEmail({ to, subject, html }) {

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;


    // Validate from address
    if (!from) {
        throw new Error("EMAIL_FROM or SMTP_USER must be configured");
    }


    // Get transporter and send email
    const mailTransporter = getTransporter();

    return mailTransporter.sendMail({
        from,
        to,
        subject,
        html
    });

}
