const nodemailer = require('nodemailer');
const logger = require('../config/winston');
require("dotenv").config();

const mail_sender = {
  send_gmail: function (param){
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      host: 'smtp.gmail.com',
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      }
    });

    const mail_options = {
      //보내는 메일의 주소
      from: `SUNBAENIM Team <${process.env.NODEMAILER_USER}>`,
      //수신 받을 이메일
      to: param.email,
      //메일 제목
      subject: param.subject,
      //메일 내용
      text: param.text
    };

    //메일 발송
    transporter.sendMail(mail_options, (error, info) => {
      if(error) return logger.error(`file: mail.js, location: transporter.sendMail, msg: ${error}`)
      return logger.info(`file: mail.js, location: transporter.sendMail, msg: Email Success ${info.response}`);
    })
  }
}

module.exports = mail_sender;