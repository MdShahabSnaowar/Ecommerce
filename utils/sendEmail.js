const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // use your provider or custom SMTP
    auth: {
      user: "shahabsanowar786@gmail.com",
      pass: "pgod frys odhr zfwd" // or real password (NOT recommended)
    }
  });

  await transporter.sendMail({
    from: '"Ecommerce" <shahabsanowar786@gmail.com>',
    to,
    subject,
    text
  });
};

module.exports = sendEmail;
