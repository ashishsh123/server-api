const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");

//Middleware
app.use(express.json());
app.use(cors());

const { Configuration, OpenAIApi } = require("openai");

// OpenAI API Configuration
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Store the stories and their identifiers
const stories = new Map();

// Generate a random story identifier
function generateStoryId() {
  return Math.floor(Math.random() * 100000).toString();
}

/*-----------------------------------------------------------------------------------------------------------------*/
// POST REQUEST------------------------------>

app.post("/summary", async (req, res) => {
  const { story } = req.body;

  // Generate a unique identifier for the story
  const storyId = generateStoryId();

  // Store the story with the generated identifier
  stories.set(storyId, story);

  const prompt = `Please summarize the following story:\n\n${story}\n\nSummary:`;
  const completions = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 200,
    n: 1,
    stop: null,
    temperature: 0.7,
  });
  const summary = completions.data.choices[0].text;

  res.json({ storyId, summary: summary });
});

/*----------------------------------------------------------------------------------------------------------- */

// GET REQUEST----------------->

app.get("/summary/:storyId", async (req, res) => {
  const { storyId } = req.params;

  // Retrieve the story based on the provided identifier
  const story = stories.get(storyId);

  if (!story) {
    return res.status(404).json({ error: "Story not found" });
  }

  const prompt = `Please summarize the following story:\n\n${story}\n\nSummary:`;
  const completions = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 200,
    n: 1,
    stop: null,
    temperature: 0.7,
  });
  const summary = completions.data.choices[0].text;

  const bulletPoints = summary
    .split(". ")
    .map((sentence) => `<li>${sentence}</li>`);

  const bulletList = `<ul>${bulletPoints.join("")}</ul>`;

  res.send(bulletList);
});

/*------------------------------------------------------------------------------------------------------------------*/

// Server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
