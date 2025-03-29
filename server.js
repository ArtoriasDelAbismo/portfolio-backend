import express, { json } from "express";
import fetch from "node-fetch";
import cors from "cors"; 
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors({ origin:"*" })); 
app.use(json()); 

const API_KEY = process.env.API_KEY;

app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required." });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: "jerojournade1@gmail.com",
        subject: `Contact Form Submission: ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><p>${message}</p>`,
      }),
    });

    if (response.ok) {
      res
        .status(200)
        .json({ status: "success", message: "Message sent successfully!" });
    } else {
      const errorData = await response.json();
      res
        .status(500)
        .json({
          status: "error",
          message: errorData.error || "Error sending message",
        });
    }
  } catch (error) {
    console.error("Error sending email:", error.message);
  
    if (error.response) {
      try {
        const errorData = await error.response.json();
        console.error("Resend API Response:", errorData);
      } catch (jsonError) {
        console.error("Could not parse error response as JSON.");
      }
    } else {
      console.error("No response received from Resend API.");
    }
  
    res.status(500).json({ status: 'error', message: 'Error sending message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
