/**
 * Base URL for all email call-to-action links
 * Points to client application where users view dashboard/chat
 * Configured via CLIENT_APP_URL or CLIENT_URL environment variables
 */
const APP_BASE_URL = process.env.CLIENT_APP_URL || process.env.CLIENT_URL || "http://localhost:5173";


// ========== FORMAT UTILITIES ==========

/**
 * Format numeric value as Bangladeshi currency
 * Returns "N/A" for invalid inputs
 * 
 * @param {number} value - Amount to format
 * 
 * @returns {string} Formatted currency string (e.g., "Tk 250,000")
 * 
 * @example
 * formatCurrency(1500000) // "Tk 1,500,000"
 * formatCurrency(0) // "Tk 0"
 * formatCurrency(null) // "N/A"
 */
function formatCurrency(value) {

    // Validate numeric input
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "N/A";
    }

    // Format with Bengali locale for thousand separators
    return `Tk ${value.toLocaleString("en-BD")}`;

}


/**
 * Escape HTML special characters to prevent XSS
 * Sanitizes user input before rendering in email templates
 * 
 * @param {string} value - String to escape
 * 
 * @returns {string} HTML-escaped string safe for email rendering
 * 
 * @example
 * escapeHtml("<script>alert('xss')</script>")
 * // Returns: "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
 */
function escapeHtml(value = "") {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

}


// ========== EMAIL TEMPLATE SHELL ==========

/**
 * Render responsive email template structure
 * Creates professional HTML email with gradient header, details table, and CTA button
 * All user inputs automatically HTML-escaped for security
 * 
 * @param {Object} config - Template configuration
 * @param {string} config.eyebrow - Small uppercase label above title
 * @param {string} config.title - Main email heading
 * @param {string} config.intro - Opening paragraph text
 * @param {Array<{label, value}>} config.details - Key-value details table rows
 * @param {string} config.ctaLabel - Call-to-action button text
 * @param {string} config.ctaUrl - Link target for CTA button
 * 
 * @returns {string} Complete HTML email template
 * 
 * @example
 * const html = renderEmailShell({
 *   eyebrow: "New Application",
 *   title: "You got an offer!",
 *   intro: "Someone is interested in your property...",
 *   details: [
 *     { label: "Property", value: "3 BHK Apartment" },
 *     { label: "Price", value: "Tk 2,500,000" }
 *   ],
 *   ctaLabel: "Review Now",
 *   ctaUrl: "https://app.example.com/dashboard"
 * });
 */
function renderEmailShell({
    eyebrow,
    title,
    intro,
    details = [],
    ctaLabel,
    ctaUrl
}) {

    // Build details table rows from array
    const detailsHtml = details
        .filter((detail) => detail.value)
        .map((detail) => `
            <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">${escapeHtml(detail.label)}</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(detail.value)}</td>
            </tr>
        `)
        .join("");

    // Render responsive HTML structure with inline CSS
    return `
        <div style="margin: 0; padding: 32px 16px; background: #f3f4f6; font-family: Arial, sans-serif;">
            <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="padding: 28px 28px 12px; background: linear-gradient(135deg, #1f2937, #ea580c); color: #ffffff;">
                    <p style="margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">${escapeHtml(eyebrow)}</p>
                    <h1 style="margin: 0; font-size: 26px; line-height: 1.25;">${escapeHtml(title)}</h1>
                </div>
                <div style="padding: 28px;">
                    <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7;">${escapeHtml(intro)}</p>
                    ${detailsHtml ? `<table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">${detailsHtml}</table>` : ""}
                    <a href="${ctaUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 10px; background: #ea580c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px;">${escapeHtml(ctaLabel)}</a>
                </div>
            </div>
        </div>
    `;

}
    const detailsHtml = details
        .filter((detail) => detail.value)
        .map((detail) => `
            <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">${escapeHtml(detail.label)}</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(detail.value)}</td>
            </tr>
        `)
        .join("");

    return `
        <div style="margin: 0; padding: 32px 16px; background: #f3f4f6; font-family: Arial, sans-serif;">
            <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="padding: 28px 28px 12px; background: linear-gradient(135deg, #1f2937, #ea580c); color: #ffffff;">
                    <p style="margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">${escapeHtml(eyebrow)}</p>
                    <h1 style="margin: 0; font-size: 26px; line-height: 1.25;">${escapeHtml(title)}</h1>
                </div>
                <div style="padding: 28px;">
                    <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7;">${escapeHtml(intro)}</p>
                    ${detailsHtml ? `<table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">${detailsHtml}</table>` : ""}
                    <a href="${ctaUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 10px; background: #ea580c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px;">${escapeHtml(ctaLabel)}</a>
                </div>
            </div>
        </div>
    `;
}


// ========== EMAIL TEMPLATE FACTORIES ==========

/**
 * Template factory functions for each notification type
 * Each factory generates subject line and HTML body from email payload
 * Receives standardized payload from emailNotificationService
 * Returns { subject, html } for email sending
 */
const templateFactories = {

    /**
     * TEMPLATE: application_submitted
     * Sent to property owner when seeker submits application
     * Notifies owner of new interest with applicant details
     */
    application_submitted: (payload) => ({
        subject: `New application received for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "New Application",
            title: "Your property received a new offer",
            intro: `${payload.actorName} submitted an application for "${payload.propertyTitle}". Review the offer details from your dashboard.`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Applicant", value: payload.actorName },
                { label: "Proposed Price", value: formatCurrency(payload.proposedPrice) },
                { label: "Message", value: payload.message || "" }
            ],
            ctaLabel: "Review Applications",
            ctaUrl: `${APP_BASE_URL}/list-property`
        })
    }),

    /**
     * TEMPLATE: counter_offer
     * Sent to seeker when owner responds with counter price
     * Notifies of owner's different price offer
     */
    counter_offer: (payload) => ({
        subject: `Counter offer received for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Counter Offer",
            title: "You received a counter offer",
            intro: `${payload.actorName} sent a counter offer for "${payload.propertyTitle}". Open your requested properties to respond.`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Counter Price", value: formatCurrency(payload.proposedPrice) },
                { label: "Message", value: payload.message || "" }
            ],
            ctaLabel: "View Counter Offer",
            ctaUrl: `${APP_BASE_URL}/list-property`
        })
    }),

    /**
     * TEMPLATE: application_rejected
     * Sent to seeker when owner rejects application
     * Notifies of application rejection
     */
    application_rejected: (payload) => ({
        subject: `Application update for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Application Rejected",
            title: "Your application was rejected",
            intro: `${payload.actorName} rejected your application for "${payload.propertyTitle}".`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Owner", value: payload.actorName }
            ],
            ctaLabel: "View Requested Properties",
            ctaUrl: `${APP_BASE_URL}/list-property`
        })
    }),

    /**
     * TEMPLATE: deal_in_progress
     * Sent to seeker when owner accepts offer
     * Notifies that deal is now active with accepted price
     */
    deal_in_progress: (payload) => ({
        subject: `Offer accepted for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Deal In Progress",
            title: "Your deal is now in progress",
            intro: `${payload.actorName} accepted the offer for "${payload.propertyTitle}". You can now continue from chat and your requested properties.`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Accepted Price", value: formatCurrency(payload.proposedPrice) }
            ],
            ctaLabel: "Open Chat",
            ctaUrl: `${APP_BASE_URL}/chat?applicationId=${payload.applicationId}`
        })
    }),

    /**
     * TEMPLATE: offer_revised
     * Sent to owner when seeker modifies their offer
     * Notifies of revised seeker price
     */
    offer_revised: (payload) => ({
        subject: `Offer revised for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Offer Revised",
            title: "The applicant revised their offer",
            intro: `${payload.actorName} revised the offer for "${payload.propertyTitle}".`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Revised Price", value: formatCurrency(payload.proposedPrice) },
                { label: "Message", value: payload.message || "" }
            ],
            ctaLabel: "Review Applications",
            ctaUrl: `${APP_BASE_URL}/list-property`
        })
    }),

    /**
     * TEMPLATE: counter_accepted
     * Sent to owner when seeker accepts counter offer
     * Notifies that deal is now finalized with agreed price
     */
    counter_accepted: (payload) => ({
        subject: `Counter offer accepted for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Counter Accepted",
            title: "Your counter offer was accepted",
            intro: `${payload.actorName} accepted your counter offer for "${payload.propertyTitle}".`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Agreed Price", value: formatCurrency(payload.proposedPrice) }
            ],
            ctaLabel: "Open Chat",
            ctaUrl: `${APP_BASE_URL}/chat?applicationId=${payload.applicationId}`
        })
    }),

    /**
     * TEMPLATE: application_withdrawn
     * Sent to owner when seeker withdraws application
     * Notifies that seeker is no longer interested
     */
    application_withdrawn: (payload) => ({
        subject: `Application withdrawn for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Application Withdrawn",
            title: "An applicant withdrew their offer",
            intro: `${payload.actorName} withdrew their application for "${payload.propertyTitle}".`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Applicant", value: payload.actorName }
            ],
            ctaLabel: "Review Applications",
            ctaUrl: `${APP_BASE_URL}/list-property`
        })
    }),

    /**
     * TEMPLATE: deal_completed
     * Sent to both owner and seeker when deal marked complete
     * Notifies of successful deal conclusion
     */
    deal_completed: (payload) => ({
        subject: `Deal completed for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Deal Completed",
            title: "The deal has been completed",
            intro: `The deal for "${payload.propertyTitle}" has been marked completed.`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Final Status", value: payload.finalStatus },
                { label: "Final Price", value: formatCurrency(payload.proposedPrice) }
            ],
            ctaLabel: "View Properties",
            ctaUrl: `${APP_BASE_URL}/list-property`
        })
    }),

    /**
     * TEMPLATE: deal_cancelled
     * Sent to both owner and seeker when deal is cancelled
     * Notifies that deal has been terminated
     */
    deal_cancelled: (payload) => ({
        subject: `Deal cancelled for ${payload.propertyTitle}`,
        html: renderEmailShell({
            eyebrow: "Deal Cancelled",
            title: "The deal has been cancelled",
            intro: `The deal for "${payload.propertyTitle}" has been cancelled and the listing is available again if applicable.`,
            details: [
                { label: "Property", value: payload.propertyTitle },
                { label: "Last Agreed Price", value: formatCurrency(payload.proposedPrice) }
            ],
            ctaLabel: "View Properties",
            ctaUrl: `${APP_BASE_URL}/list-property`
        })
    })

};


// ========== TEMPLATE RENDERER ==========

/**
 * Render email template by type and payload
 * Looks up template factory for email type and generates final subject and HTML
 * 
 * @param {string} type - Email template type identifier
 *                        (application_submitted, counter_offer, application_rejected, etc.)
 * @param {Object} payload - Email data containing property, user, price, message info
 * 
 * @returns {Object} Rendered email
 * @returns {string} result.subject - Email subject line
 * @returns {string} result.html - Responsive HTML email body
 * 
 * @throws {Error} If email type is not supported
 * 
 * @example
 * const { subject, html } = renderEmailTemplate('application_submitted', {
 *   propertyTitle: '3 BHK Apartment',
 *   actorName: 'John Doe',
 *   proposedPrice: 2500000,
 *   message: '',
 *   applicationId: '507f1f77bcf86cd799439011'
 * });
 * 
 * // Returns:
 * // {
 * //   subject: "New application received for 3 BHK Apartment",
 * //   html: "<div style=\"...\">"
 * // }
 */
export function renderEmailTemplate(type, payload) {

    // Look up template factory function for email type
    const templateFactory = templateFactories[type];

    // Throw error if template type not found
    if (!templateFactory) {
        throw new Error(`Unsupported email template type: ${type}`);
    }

    // Call factory to generate subject and HTML from payload
    return templateFactory(payload);

}
