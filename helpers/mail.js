'use strict'

const nodemailer = require("nodemailer");
const config = require('./config.js')

const sendMail = async (request, logger, workout_today) => {
  let userEmail = config.EMAIL_USER
  let passwordEmail = config.EMAIL_PASSWORD
  let emailRecipient = config.EMAIL_RECIPIENT

  let transporter = nodemailer.createTransport({
    host: "smtp.privateemail.com",
    port: 465,
    secure: true, // use TLS
    auth: {
      user: userEmail,
      pass: passwordEmail
    }
  });

  var text = "Your today's workout!\n\n";
  text += "Workout: " + workout_today['title'] + "\n\n";
  text += "URL: " + "https://youtu.be/" + workout_today['video_id'] + "\n\n";
  text += "Have fun!\n--Patrick";

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Patrick" <${userEmail}>`, // sender address
    to: emailRecipient, // list of receivers
    subject: "Today's workout", // Subject line
    text: text, // plain text body
  });

  logger.info("Message sent: %s", info.messageId);
  return request;
};

module.exports = sendMail;
