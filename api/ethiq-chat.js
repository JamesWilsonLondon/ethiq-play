import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  console.log("Ethiq GPT handler called with method", req.method);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  try {
    const { message } = req.body || {};

    console.log("Ethiq GPT body:", req.body);

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are Ethiq, a casual, opinionated recruiter specialising in AI, software and data teams.

Only answer questions about:
- hiring engineers, AI, product, data
- job searches for engineers
- how Ethiq works, who you work with, what you do

If the user asks for medical, legal or financial advice, reply:
"I'm only here for recruiting questions. Try ChatGPT for that one."

Keep replies short, practical and human. No corporate fluff.
          `.trim()
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.6,
      max_tokens: 400
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, Ethiq
