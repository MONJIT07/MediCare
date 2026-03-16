const nodemailer = require('nodemailer');


async function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {

    console.log(`📧 Email mode: GMAIL (${process.env.EMAIL_USER})`);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password (16 chars, not regular password)
      },
    });
  }


  console.log('⚠️  Email mode: ETHEREAL (fake/demo) — emails will NOT reach real inboxes!');
  console.log('   → To fix: add EMAIL_USER and EMAIL_PASS (Gmail App Password) to backend/.env');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

function baseTemplate(content) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; }
      .wrapper { max-width: 580px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #10b981, #059669); padding: 32px 40px; text-align: center; }
      .header-logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .logo-dot { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; justify-content: center; font-size: 18px; }
      .header h1 { color: #fff; font-size: 22px; font-weight: 700; }
      .header p  { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 4px; }
      .body { padding: 36px 40px; }
      .greeting { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 12px; }
      .message  { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 24px; }
      .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
      .card h3 { font-size: 13px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
      .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px; }
      .detail-row:last-child { margin-bottom: 0; }
      .detail-label { color: #6b7280; font-weight: 500; }
      .detail-value { color: #111827; font-weight: 700; text-align: right; }
      .status-pill { display: inline-block; padding: 3px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; }
      .status-pending   { background: #fef3c7; color: #92400e; }
      .status-confirmed { background: #d1fae5; color: #065f46; }
      .status-completed { background: #dbeafe; color: #1e40af; }
      .status-cancelled { background: #fee2e2; color: #991b1b; }
      .btn-block { display: block; width: 100%; text-align: center; background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; margin-bottom: 24px; }
      .btn-wa { display: block; width: 100%; text-align: center; background: #25d366; color: #fff; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; margin-bottom: 16px; }
      .note { font-size: 12px; color: #9ca3af; line-height: 1.6; }
      .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
      .footer strong { color: #10b981; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <div class="header-logo">
          <span class="logo-dot">❤️</span>
        </div>
        <h1>MediCare+</h1>
        <p>Premium Healthcare — by Monjit Tamuli</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>📞 <strong>+91 86385 05906</strong> &nbsp;|&nbsp; MediCare+ Hospital Management</p>
        <p style="margin-top:6px">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    </div>
  </body>
  </html>`;
}

async function sendBookingConfirmation(appointment) {
  try {
    const transporter = await createTransporter();
    const date = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const html = baseTemplate(`
      <p class="greeting">Hello, ${appointment.patientName}! 👋</p>
      <p class="message">
        Your appointment request at <strong>MediCare+</strong> has been received successfully.
        Our team will review your request and confirm it shortly. You'll receive another email once confirmed with your assigned doctor's details.
      </p>

      <div class="card">
        <h3>📋 Appointment Details</h3>
        <div class="detail-row">
          <span class="detail-label">Reference ID</span>
          <span class="detail-value" style="font-family:monospace;color:#10b981">#${appointment._id.toString().slice(-8).toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Department</span>
          <span class="detail-value">${appointment.department}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time Slot</span>
          <span class="detail-value">${appointment.timeSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-pill status-pending">⏳ Pending Confirmation</span></span>
        </div>
      </div>

      <a href="https://wa.me/918638505906?text=Hi%20MediCare%2B%2C%20my%20appointment%20ID%20is%20%23${appointment._id.toString().slice(-8).toUpperCase()}%20for%20${encodeURIComponent(appointment.department)}.%20Please%20confirm." class="btn-wa">
        💬 Message Us on WhatsApp to Confirm Faster
      </a>

      <p class="note">
        <strong>What's next?</strong><br/>
        We will review your request within a few hours and send you a confirmation email with your assigned doctor's name and any preparation instructions. 
        For urgent queries, call us at <strong>+91 86385 05906</strong>.
      </p>
    `);

    const info = await transporter.sendMail({
      from: `"MediCare+" <${process.env.EMAIL_USER || 'medicare@ethereal.email'}>`,
      to: appointment.patientEmail,
      subject: `✅ Appointment Request Received — MediCare+ #${appointment._id.toString().slice(-8).toUpperCase()}`,
      html,
    });

    console.log(`📧 Booking confirmation sent to ${appointment.patientEmail}`);
    if (!process.env.EMAIL_USER) {
      console.log(`   📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (err) {
    console.error('Email error (booking):', err.message);
  }
}

async function sendAppointmentConfirmed(appointment) {
  try {
    const transporter = await createTransporter();
    const date = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const html = baseTemplate(`
      <p class="greeting">Great news, ${appointment.patientName}! 🎉</p>
      <p class="message">
        Your appointment has been <strong style="color:#10b981">confirmed</strong>! 
        ${appointment.doctor ? `You have been assigned <strong>Dr. ${appointment.doctor}</strong> for your visit.` : 'A specialist from our ' + appointment.department + ' team will attend to you.'}
        Please arrive 10 minutes before your scheduled time.
      </p>

      <div class="card">
        <h3>✅ Confirmed Appointment</h3>
        <div class="detail-row">
          <span class="detail-label">Reference ID</span>
          <span class="detail-value" style="font-family:monospace;color:#10b981">#${appointment._id.toString().slice(-8).toUpperCase()}</span>
        </div>
        ${appointment.doctor ? `
        <div class="detail-row">
          <span class="detail-label">Your Doctor</span>
          <span class="detail-value">👨‍⚕️ ${appointment.doctor}</span>
        </div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Department</span>
          <span class="detail-value">${appointment.department}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time Slot</span>
          <span class="detail-value">${appointment.timeSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-pill status-confirmed">✅ Confirmed</span></span>
        </div>
        ${appointment.notes ? `
        <div class="detail-row" style="margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb">
          <span class="detail-label">Notes from Admin</span>
          <span class="detail-value" style="max-width:220px;text-align:right">${appointment.notes}</span>
        </div>` : ''}
      </div>

      <div class="card" style="background:#f0fdf4;border-color:#a7f3d0">
        <h3 style="color:#059669">📍 Visit Instructions</h3>
        <div class="detail-row"><span class="detail-label">Arrive</span><span class="detail-value">10 min early</span></div>
        <div class="detail-row"><span class="detail-label">Bring</span><span class="detail-value">ID Proof + Previous Reports</span></div>
        <div class="detail-row"><span class="detail-label">Contact</span><span class="detail-value">+91 86385 05906</span></div>
      </div>

      <a href="https://wa.me/918638505906?text=Hi%20MediCare%2B%2C%20I%20have%20a%20confirmed%20appointment%20%23${appointment._id.toString().slice(-8).toUpperCase()}" class="btn-wa">
        💬 Contact Us on WhatsApp
      </a>

      <p class="note">If you need to reschedule or cancel, please contact us at least 24 hours in advance at +91 86385 05906.</p>
    `);

    const info = await transporter.sendMail({
      from: `"MediCare+" <${process.env.EMAIL_USER || 'medicare@ethereal.email'}>`,
      to: appointment.patientEmail,
      subject: `🩺 Appointment Confirmed — ${appointment.doctor ? 'Dr. ' + appointment.doctor + ' assigned' : 'MediCare+'} | #${appointment._id.toString().slice(-8).toUpperCase()}`,
      html,
    });

    console.log(`📧 Confirmation email sent to ${appointment.patientEmail}`);
    if (!process.env.EMAIL_USER) {
      console.log(`   📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (err) {
    console.error('Email error (confirmed):', err.message);
  }
}

async function sendAppointmentCancelled(appointment) {
  try {
    const transporter = await createTransporter();

    const html = baseTemplate(`
      <p class="greeting">Hello, ${appointment.patientName}</p>
      <p class="message">
        We're sorry to inform you that your appointment request for <strong>${appointment.department}</strong> 
        has been <strong style="color:#ef4444">cancelled</strong>.
        ${appointment.notes ? `<br/><br/>Reason: <em>${appointment.notes}</em>` : ''}
      </p>

      <div class="card">
        <h3>❌ Cancelled Appointment</h3>
        <div class="detail-row">
          <span class="detail-label">Reference ID</span>
          <span class="detail-value" style="font-family:monospace">#${appointment._id.toString().slice(-8).toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Department</span>
          <span class="detail-value">${appointment.department}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-pill status-cancelled">❌ Cancelled</span></span>
        </div>
      </div>

      <a href="https://wa.me/918638505906?text=Hi%20MediCare%2B%2C%20I%27d%20like%20to%20rebook%20appointment%20%23${appointment._id.toString().slice(-8).toUpperCase()}" class="btn-block">
        📅 Book a New Appointment
      </a>

      <p class="note">We apologize for any inconvenience. Please feel free to book a new appointment or contact us at +91 86385 05906.</p>
    `);

    await transporter.sendMail({
      from: `"MediCare+" <${process.env.EMAIL_USER || 'medicare@ethereal.email'}>`,
      to: appointment.patientEmail,
      subject: `❌ Appointment Cancelled — MediCare+ #${appointment._id.toString().slice(-8).toUpperCase()}`,
      html,
    });

    console.log(`📧 Cancellation email sent to ${appointment.patientEmail}`);
  } catch (err) {
    console.error('Email error (cancelled):', err.message);
  }
}

module.exports = { sendBookingConfirmation, sendAppointmentConfirmed, sendAppointmentCancelled };
