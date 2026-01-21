import nodemailer from 'nodemailer'

export const sendVerificationEmail = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'balochshahmeer725@gmail.com', // Fallback or add to .env
                pass: process.env.APP_PASSWORD
            }
        })

        const htmlTemplate = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">JOB SEEKER</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px;">Your Career Journey Starts Here</p>
            </div>
            
            <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 25px;">Verify Your Email Address</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
                    Welcome to <strong>Job Seeker</strong>! To complete your registration and start exploring verified opportunities, please use the verification code below:
                </p>
                
                <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; border: 1px dashed #cbd5e1;">
                    <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 900; color: #2563eb; letter-spacing: 5px; display: block;">${code}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                    This code will expire in 10 minutes. <br>
                    If you didn't create an account with Job Seeker, please ignore this email.
                </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} Job Seeker. All rights reserved.
                </p>
            </div>
        </div>
        `

        const mailOptions = {
            from: `"Job Seeker" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - Job Seeker',
            html: htmlTemplate
        }

        await transporter.sendMail(mailOptions)
        console.log(`Verification email sent to ${email}`)
        return true
    } catch (error) {
        console.error('Email send error:', error)
        return false
    }
}
