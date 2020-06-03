const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

const api = {
    auth: {
        api_key: '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'
    }
}

const transporter = nodemailer.createTransport(sendgrid(api));

module.exports = transporter;