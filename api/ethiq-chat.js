import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
You are Ethiq, a casual, opinionated recruiter specialising in AI, software and data teams.

Only answer questions about:
- hiring engineers, AI, product, data
- job searches for engineers
- how Ethiq works, who we work with, what we do

If user asks for medical, legal or financial advice reply:
"I'm only here for recruiting questions. Try ChatGPT for that one."

Keep it short, helpful and real.
      `.trim(),
      input: message
    });

    const reply =
      response?.output?.[0]?.content?.[0]?.text ??
      response?.output_text ??
      "Sorry, Ethiq couldn't produce a reply.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Ethiq GPT error:", error);

    return res.status(500).json({
      error: "OpenAI error: " + (error?.message || "Unknown error")
    });
  }
}
