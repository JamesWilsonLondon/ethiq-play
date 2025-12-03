// Temporary debug version of the API – no OpenAI involved

export default async function handler(req, res) {
  console.log("DEBUG: /api/ethiq-chat called with method", req.method);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // In Vercel Node functions, JSON body is already parsed if
    // Content-Type: application/json is sent.
    const { message } = req.body || {};

    console.log("DEBUG: body received:", req.body);

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Just echo the message back so we know the plumbing works
    return res.status(200).json({
      reply: `Echo from Ethiq test API: "${message}"`
    });
  } catch (error) {
    console.error("DEBUG: handler crashed:", error);
    return res.status(500).json({ error: "Handler crashed" });
  }
}
