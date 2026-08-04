import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Delay helper function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper to gracefully handle 429 Rate Limits
async function generateWithRetry(model, prompt, retries = 3, delay = 20000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        console.log(`Rate limit reached (429). Waiting ${delay / 1000} seconds before retrying...`);
        await sleep(delay);
        delay *= 2; // Increase delay on subsequent retries
      } else {
        throw error;
      }
    }
  }
}

async function runSEOAgent() {
  console.log("🤖 AI SEO Agent for BookMyHomez started...");

  let codeSnippet = '';
  if (fs.existsSync('./index.html')) {
    codeSnippet = fs.readFileSync('./index.html', 'utf8');
  } else if (fs.existsSync('./src/App.tsx')) {
    codeSnippet = fs.readFileSync('./src/App.tsx', 'utf8');
  }

  // Updated working model string
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are an autonomous SEO Optimization Agent for a home rental platform "BookMyHomez".
Analyze the website code below and provide optimal SEO Metadata.

Code snippet:
${codeSnippet}

Return ONLY a valid JSON object with these exact keys:
{
  "title": "Optimized Page Title (max 60 chars)",
  "description": "Optimized Meta Description (max 160 chars)",
  "keywords": "comma, separated, keywords"
}
Do not include any backticks or markdown formatting like \`\`\`json.
`;

  try {
    const result = await generateWithRetry(model, prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();

    // Verify valid JSON before saving
    JSON.parse(responseText);

    fs.writeFileSync('./public/seo-metadata.json', responseText);
    console.log("✅ Successfully updated public/seo-metadata.json");
  } catch (error) {
    console.error("❌ Error generating SEO metadata:", error);
    process.exit(1);
  }
}

runSEOAgent();
