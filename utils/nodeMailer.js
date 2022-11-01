const nodemailer = require('nodemailer');

nodemailer.createTransport({ sendmail: true })

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASS
    }
});

module.exports = transporter