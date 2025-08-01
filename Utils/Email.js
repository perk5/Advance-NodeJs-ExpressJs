const nodemailer = require('nodemailer')

const sendEmail = async (option) => {
    //Create a transporter
    const transporter = nodemailer.createTransport({ 
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    //DEFINE EMAIL OPTIONS
    const emailOptions = {
        from: 'CineFlex Support<support@cineflix.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendMail(emailOptions)   
}

module.exports = sendEmail