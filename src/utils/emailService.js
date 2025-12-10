const sgMail = require("@sendgrid/mail");

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Generic function to send email
const sendEmail = async (options) => {
  try {
    const msg = {
      to: options.to,
      from: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || "Raising African Children",
      },
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo || process.env.EMAIL_FROM,
    };

    const response = await sgMail.send(msg);

    console.log("Email sent successfully:", response[0].statusCode);
    return {
      success: true,
      messageId: response[0].headers["x-message-id"],
      statusCode: response[0].statusCode,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("SendGrid error details:", error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send contact form notification to admin
 */
const sendContactNotification = async (contactData) => {
  const { name, email, subject, message } = contactData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #4CAF50; }
        .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${subject}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from Raising African Children contact form</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}
  `;

  return await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact: ${subject}`,
    text,
    html,
    replyTo: email,
  });
};

/**
 * Send testimonial submission notification to admin
 */
const sendTestimonialNotification = async (testimonialData) => {
  const { name, email, message, rating } = testimonialData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #FF9800; }
        .rating { color: #FFD700; font-size: 20px; }
        .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Testimonial Submission</h2>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <div class="label">Rating:</div>
            <div class="value">
              <span class="rating">${"★".repeat(rating)}${"☆".repeat(
    5 - rating
  )}</span> (${rating}/5)
            </div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from Raising African Children testimonials</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Testimonial Submission

Name: ${name}
Email: ${email}
Rating: ${rating}/5
Message: ${message}
  `;

  return await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Testimonial from ${name}`,
    text,
    html,
    replyTo: email,
  });
};

/**
 * Send welcome email to new admin
 */
const sendAdminWelcomeEmail = async (adminData) => {
  const { email, firstName, lastName } = adminData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Welcome to Raising African Children Admin Panel</h2>
        </div>
        <div class="content">
          <p>Hello ${firstName} ${lastName},</p>
          <p>Your admin account has been successfully created for the Raising African Children platform.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>You can now access the admin dashboard to manage blogs, testimonials, and contact submissions.</p>
          <a href="${
            process.env.ADMIN_DASHBOARD_URL || process.env.FRONTEND_URL
          }" class="button">Access Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated email from Raising African Children</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Raising African Children Admin Panel

Hello ${firstName} ${lastName},

Your admin account has been successfully created for the Raising African Children platform.

Email: ${email}

You can now access the admin dashboard to manage blogs, testimonials, and contact submissions.

Dashboard URL: ${process.env.ADMIN_DASHBOARD_URL || process.env.FRONTEND_URL}
  `;

  return await sendEmail({
    to: email,
    subject: "Welcome to Raising African Children Admin Panel",
    text,
    html,
  });
};

/**
 * Test email configuration
 */
const testEmailConfiguration = async () => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is not configured");
    }
    console.log("✓ Email configuration is valid and ready to send emails");
    return {
      success: true,
      message: "Email configuration verified successfully",
    };
  } catch (error) {
    console.error("✗ Email configuration error:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendEmail,
  sendContactNotification,
  sendTestimonialNotification,
  sendAdminWelcomeEmail,
  testEmailConfiguration,
};
