import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendAlertEmail(
  managerEmail: string,
  employeeName: string,
  employeeScore: number,
  riskReason: string
) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: managerEmail,
      subject: `🚨 Alert: ${employeeName} - Responsibility Score Action Required`,
      html: `
        <h2>⚠️ Employee Alert</h2>
        <p><strong>Employee:</strong> ${employeeName}</p>
        <p><strong>Current Score:</strong> <span style="color: #ef4444; font-size: 1.5rem; font-weight: bold;">${employeeScore}</span></p>
        <p><strong>Issue:</strong> ${riskReason}</p>
        <hr />
        <p><strong>Action Required:</strong></p>
        <ul>
          <li>Review employee's recent performance</li>
          <li>Discuss improvement plan</li>
          <li>Log reason for any score adjustments</li>
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://staging.hr.zuhaib.pro'}" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </p>
        <p style="color: #999; font-size: 0.9rem;">Responsify HR System</p>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}