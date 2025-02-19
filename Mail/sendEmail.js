import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "deveneoxys@gmail.com", // Your email
        pass: "lofatahbsxotprzg", // Your email app password
      },
    });

    let mailOptions = {
      from: '"Node Project Email" <deveneoxys@gmail.com>',
      to: to, // Recipient's email
      subject: subject,
      text: text, // Email body (plain text)
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
