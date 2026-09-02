export default async function handler(req, res) {

  // Allow your GitHub Pages website to call this backend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: "Please send a message."
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",

          messages: [
            {
              role: "system",
              content:
                "You are JARVIS, a helpful AI voice assistant. Give clear and concise answers."
            },
            {
              role: "user",
              content: message
            }
          ],

          max_tokens: 300
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Hugging Face error:", data);

      return res.status(500).json({
        reply:
          "My AI service returned an error. Please check the Hugging Face token."
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {

    console.error("Backend error:", error);

    return res.status(500).json({
      reply: "I cannot connect to my AI brain right now."
    });
  }
            }
