const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

const api = {
    auth: {
        
    }
}

const transporter = nodemailer.createTransport(sendgrid(api));

module.exports = transporter;
