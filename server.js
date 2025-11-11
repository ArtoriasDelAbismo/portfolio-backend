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

// prefer explicit env names and allow both for backward compat
const API_KEY = process.env.API_KEY || process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const resend = new Resend(API_KEY);

// health route for quick diagnostics
app.get("/", (req, res) => {
  res.json({ status: "ok", api_key_set: !!API_KEY, from: FROM_EMAIL });
});

app.post("/send-email", async (req, res) => {
  const { name, email, message, subject } = req.body;

  if (!name || !email || !message || !subject) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required." });
  }

  if (!API_KEY) {
    console.error("Missing Resend API key (set API_KEY or RESEND_API_KEY)");
    return res.status(500).json({ status: "error", message: "Server misconfigured" });
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ['jerojournade1@gmail.com'],
      replyTo: email,
      subject: `Contact Form Submission: ${subject}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    });

    return res.status(200).json({
      status: "success",
      message: "Message sent successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Error sending email via Resend:", error);
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
