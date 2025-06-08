import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Chatty" <${process.env.EMAIL_USER}>`,
      to,
      subject: "OTP for Password Reset",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  });
    console.log("✅ OTP email sent to", to);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw new Error("Failed to send email");
  }
};

export { sendEmail };
