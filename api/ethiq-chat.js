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

  const { message } = req.body || {};
  console.log("Ethiq GPT body:", req.body);

  // If the message is missing, don't throw – just reply nicely
  if (!message || typeof message !== "string") {
    return res.status(200).json({
      reply: "Tell me what you’re trying to hire or what move you’re considering."
    });
  }

  // If API key is missing, don’t crash – tell us in the reply and logs
  if (!process.env.OPENAI_API_KEY) {
    console.error("Ethiq GPT error: OPENAI_API_KEY is missing in environment");
    return res.status(200).json({
      reply: "Ethiq isn’t fully wired up yet (missing API key on the server)."
    });
  }

  try {
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
      "Sorry, Ethiq couldn’t think of anything to say.";

    console.log("Ethiq GPT reply:", reply);

    return res.status(200).json({ reply });
  } catch (error) {
    // Log *everything* so we can see the real cause in Vercel
    console.error("Ethiq GPT error:", error?.message || error, error?.response?.data);

    const msg = error?.message || "Unknown OpenAI error";
    return res.status(200).json({
      reply: `Ethiq hit a config issue talking to OpenAI: ${msg}`
    });
  }
}
