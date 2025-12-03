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
You are Ethiq, a casual, clear, PostHog-style recruitment assistant.

Only talk about:
- hiring engineers, product people, AI and data roles
- how Ethiq works
- job searches for engineers or data people

If asked about anything else (medical, legal, finance etc), say:
"I'm here for recruiting questions only. Try ChatGPT for that one."

Keep replies short, sharp, helpful.
      `,
      input: message
    });

    const reply =
      response.output?.[0]?.content?.[0]?.text ??
      "Ethiq is thinking but did not return a reply.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Ethiq GPT error:", err);
    return res.status(500).json({
      error: "Something went wrong talking to Ethiq GPT."
    });
  }
}

