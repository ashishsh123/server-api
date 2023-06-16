const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

const { Configuration, OpenAIApi } = require("openai");

// OpenAI API Configuration
const config = new Configuration({
  organization: "org-3KoojXGycJQ1YL7x2rhQeRSN",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// POST Request
app.post("/summary", async (req, res) => {
  try {
    const { story } = req.body;

    if (!story) {
      return res.status(400).json({ error: "Please provide a story." });
    }

    const prompt = `Please summarize the following story:\n\n${story}\n\nSummary for news article:`;
    const completions = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${prompt}`,
        },
      ],
      max_tokens: 256,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    const summary = completions.data.choices[0].message.content;

    res.json({ summary });
  } catch (error) {
    console.error("Error during summary generation:", error);
    res
      .status(500)
      .json({ error: "An error occurred during summary generation." });
  }
});

// Server
const port = 3001;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
