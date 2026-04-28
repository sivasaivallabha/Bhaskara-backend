const nodemailer = require("nodemailer");

const sendEmail = async (data) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sivasaivallabha@gmail.com",
      pass: "eumy bazq denx qalp"
    }
  });

  const mailOptions = {
  from: `"${data.name}" <sivasaivallabha@gmail.com>`, // your mail
  to: "vatalayaswitha03@gmail.com", // your receiving mail
  replyTo: data.email, // student mail

  subject: "New Admission Application",

  text: `
New Application Received:

Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
City: ${data.city}
Course: ${data.course}
Marks: ${data.marks}

Message: ${data.message}
  `
};

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;