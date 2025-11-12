const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateDescription = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Drop name is required" });
  }

  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    // Return the mock response if key is missing
    await new Promise(resolve => setTimeout(resolve, 500));
    return res.json({
      description: `(Mock) This is a test description for "${name}". Set OPENAI_API_KEY for a real one.`,
    });
  }

  try {
    // This is the prompt for the AI
    const prompt = `You are a hype-focused copywriter for a streetwear brand. Write a short, exciting product description (2-3 sentences) for an upcoming drop named "${name}". Make it sound exclusive and limited.`;

    // Make the API call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    const aiDescription = completion.choices[0].message.content.trim();

    res.json({
      description: aiDescription,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Failed to generate AI description" });
  }
};
