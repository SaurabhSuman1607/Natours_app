const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const sendEmail = async options => {
    

    // Create the transporter
    const transporter =nodemailer.createTransport({
       host:process.env.EMAIL_HOST  ||  'sandbox.smtp.mailtrap.io',
       port:process.env.EMAIL_PORT  || 25,
        auth : {
            user : process.env.EMAIL_USERNAME || '1ca14fcd8b116d',
            pass : process.env.EMAIL_PASSWORD || '2d75a7b4726290'
        }
    
    })

    //define the email option
    const mailOptions = {
        from : 'Saurabh Suman saurabhsuman1607@gmail.com',
        to : options.email,
        subject : options.subject,
        text : options.message 
        
    };

    //Actually send the mail
    await transporter.sendMail(mailOptions)
};

module.exports = sendEmail;