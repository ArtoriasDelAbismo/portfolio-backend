import express, { json } from "express";
import fetch from "node-fetch";
import cors from "cors"; 
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();
const app = express();
// fallback port for local testing
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" })); 
// allow preflight for all routes
app.options("*", cors({ origin: "*" }));
app.use(json()); 

const API_KEY = process.env.API_KEY;
const resend = new Resend(API_KEY);


app.post("/send-email", async (req, res) => {
  const { name, email, message, subject } = req.body;

  if (!name || !email || !message || !subject) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required." });
  }

  try {
    // use Resend SDK instead of manual fetch
    const result = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['jerojournade1@gmail.com'],
      subject: `Contact Form Submission: ${subject}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    });

    // resend.emails.send returns data object on success
    return res.status(200).json({
      status: "success",
      message: "Message sent successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    // surface useful error info to logs, but keep client response generic
    return res.status(500).json({
      status: "error",
      message: "Error sending message",
      error: (error && error.message) ? error.message : undefined,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
